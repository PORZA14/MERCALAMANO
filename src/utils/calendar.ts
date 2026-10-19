import type { CalendarEvent, EventCategory, SiteConfig } from '../types';

export const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const DAYS_OF_WEEK = [
  'Dom',
  'Lun',
  'Mar',
  'Mié',
  'Jue',
  'Vie',
  'Sáb',
];

export const DAYS_OF_WEEK_FULL = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const EVENT_CATEGORIES: { name: EventCategory; color: string }[] = [
  { name: 'Publicaciones', color: '#4E689B' },
  { name: 'Reuniones', color: '#FD7C5E' },
  { name: 'Eventos', color: '#90AED1' },
  { name: 'Entregas', color: '#4E689B' },
  { name: 'Activaciones', color: '#FD7C5E' },
  { name: 'Fechas importantes', color: '#000000' },
  { name: 'Otros', color: '#90AED1' },
];

export const OFFICIAL_COLORS = [
  { name: 'Azul Confianza', hex: '#4E689B' },
  { name: 'Azul Inspiración', hex: '#90AED1' },
  { name: 'Salmón', hex: '#FD7C5E' },
  { name: 'Negro', hex: '#000000' },
];

export interface CalendarDayInfo {
  dayNumber: number;
  dateString: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

/**
 * Returns current date components in America/Bogota timezone
 */
export function getBogotaCurrentDate(): {
  year: number;
  month: number; // 0 to 11
  day: number;
  dateString: string;
} {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(now);
    const year = Number(parts.find((p) => p.type === 'year')?.value ?? now.getFullYear());
    const month = Number(parts.find((p) => p.type === 'month')?.value ?? now.getMonth() + 1) - 1; // 0-indexed
    const day = Number(parts.find((p) => p.type === 'day')?.value ?? now.getDate());
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { year, month, day, dateString };
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { year, month, day, dateString };
  }
}

/**
 * Resolves initial calendar view based on site configuration
 */
export function resolveInitialCalendarState(config?: SiteConfig | null): {
  year: number;
  month: number;
  isAuto: boolean;
  modeLabel: string;
} {
  const bogota = getBogotaCurrentDate();
  const mode = config?.calendarInitialMonthMode;

  if (!mode || mode === 'auto') {
    return {
      year: bogota.year,
      month: bogota.month,
      isAuto: true,
      modeLabel: 'Automático (Mes actual)',
    };
  }

  const fixedMonth = Number(mode);
  if (!isNaN(fixedMonth) && fixedMonth >= 0 && fixedMonth <= 11) {
    return {
      year: 2027,
      month: fixedMonth,
      isAuto: false,
      modeLabel: `${MONTH_NAMES[fixedMonth]} 2027`,
    };
  }

  // Fallback to featuredMonth if present
  const fallbackMonth = config?.featuredMonth ?? 0;
  return {
    year: 2027,
    month: fallbackMonth,
    isAuto: false,
    modeLabel: `${MONTH_NAMES[fallbackMonth]} 2027`,
  };
}

/**
 * Calculates calendar cells for ANY given month and year.
 * Week starts on Sunday (index 0).
 */
export function getMonthMatrix(
  year: number,
  monthIndex: number,
  events: CalendarEvent[]
): CalendarDayInfo[] {
  // First day of month
  const firstDayDate = new Date(year, monthIndex, 1);
  const startDayOfWeek = firstDayDate.getDay(); // 0 is Sunday

  // Total days in this month
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Days in previous month
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();

  const matrix: CalendarDayInfo[] = [];

  // Today string in Bogota
  const bogota = getBogotaCurrentDate();
  const todayStr = bogota.dateString;

  // Pad previous month days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevMonth = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    matrix.push({
      dayNumber: day,
      dateString: dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: events.filter((e) => e.date === dateStr),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    matrix.push({
      dayNumber: day,
      dateString: dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      events: events.filter((e) => e.date === dateStr),
    });
  }

  // Pad next month days to complete 35 or 42 cells (7 columns)
  const remainingCells = 7 - (matrix.length % 7);
  if (remainingCells < 7) {
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
      const nextYear = monthIndex === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      matrix.push({
        dayNumber: day,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        events: events.filter((e) => e.date === dateStr),
      });
    }
  }

  return matrix;
}

export function formatEventDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayName = DAYS_OF_WEEK_FULL[date.getDay()];
    const monthName = MONTH_NAMES[month - 1];
    return `${dayName}, ${day} de ${monthName} de ${year}`;
  } catch {
    return dateStr;
  }
}
