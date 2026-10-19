export interface CalendarExportItem {
  title: string;
  date: string;
  time?: string;
  description?: string;
  location?: string;
}

interface CalendarRange {
  allDay: boolean;
  start: string;
  end: string;
}

function formatUtcDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function getCalendarRange(date: string, time?: string): CalendarRange {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error('La fecha del evento no es válida');

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const startOfDay = new Date(Date.UTC(year, month - 1, day));
  if (
    startOfDay.getUTCFullYear() !== year ||
    startOfDay.getUTCMonth() !== month - 1 ||
    startOfDay.getUTCDate() !== day
  ) {
    throw new Error('La fecha del evento no es válida');
  }

  const timeMatch = time?.match(/(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)?/i);
  if (timeMatch) {
    let hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    const period = timeMatch[3]?.toLowerCase().replace(/\./g, '').replace(/\s/g, '');
    if (minute > 59 || (period && (hour < 1 || hour > 12)) || (!period && hour > 23)) {
      throw new Error('La hora del evento no es válida');
    }
    if (period === 'pm' && hour < 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;

    const start = new Date(Date.UTC(year, month - 1, day, hour + 5, minute));
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { allDay: false, start: formatUtcDate(start), end: formatUtcDate(end) };
  }

  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
  return {
    allDay: true,
    start: `${yearText}${monthText}${dayText}`,
    end: `${endOfDay.getUTCFullYear()}${String(endOfDay.getUTCMonth() + 1).padStart(2, '0')}${String(endOfDay.getUTCDate()).padStart(2, '0')}`,
  };
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function buildCalendarFile(item: CalendarExportItem): string {
  const range = getCalendarRange(item.date, item.time);
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@merc-alamano`;
  const dateLines = range.allDay
    ? `DTSTART;VALUE=DATE:${range.start}\r\nDTEND;VALUE=DATE:${range.end}`
    : `DTSTART:${range.start}\r\nDTEND:${range.end}`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Merc a la Mano//Calendar//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatUtcDate(new Date())}`,
    dateLines,
    `SUMMARY:${escapeIcsText(item.title)}`,
    ...(item.description ? [`DESCRIPTION:${escapeIcsText(item.description)}`] : []),
    ...(item.location ? [`LOCATION:${escapeIcsText(item.location)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.join('\r\n')}\r\n`;
}

export function openGoogleCalendar(item: CalendarExportItem): void {
  const range = getCalendarRange(item.date, item.time);
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', item.title);
  url.searchParams.set('dates', `${range.start}/${range.end}`);
  if (item.description) url.searchParams.set('details', item.description);
  if (item.location) url.searchParams.set('location', item.location);
  window.open(url.toString(), '_blank', 'noopener,noreferrer');
}

export function downloadAppleCalendarFile(item: CalendarExportItem): void {
  const slug = item.title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'evento';
  const blob = new Blob([buildCalendarFile(item)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}