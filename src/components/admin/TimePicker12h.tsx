import React from 'react';

interface TimePicker12hProps {
  value?: string;
  onChange: (value: string) => void;
}

function parseTime(value?: string) {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([ap])\.?\s*m\.?)?$/i);
  if (!match) return { hour: '', minute: '00', period: 'AM' as const };

  const rawHour = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = match[3]?.toUpperCase();
  if (minute > 59 || rawHour > (suffix ? 12 : 23) || rawHour < (suffix ? 1 : 0)) {
    return { hour: '', minute: '00', period: 'AM' as const };
  }

  const period = (suffix || (rawHour >= 12 ? 'P' : 'A')) === 'P' ? 'PM' : 'AM';
  const hour = suffix ? rawHour : rawHour % 12 || 12;
  return { hour: String(hour), minute: String(minute).padStart(2, '0'), period };
}

function to24Hour(hour: string, minute: string, period: 'AM' | 'PM'): string {
  let hour24 = Number(hour) % 12;
  if (period === 'PM') hour24 += 12;
  return `${String(hour24).padStart(2, '0')}:${minute}`;
}

export const TimePicker12h: React.FC<TimePicker12hProps> = ({ value, onChange }) => {
  const parsed = parseTime(value);

  const update = (hour: string, minute: string, period: 'AM' | 'PM') => {
    onChange(hour ? to24Hour(hour, minute, period) : '');
  };

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Hora"
        value={parsed.hour}
        onChange={(event) => update(event.target.value, parsed.minute, parsed.period)}
        className="min-w-0 flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
      >
        <option value="">Hora</option>
        {Array.from({ length: 12 }, (_, index) => String(index + 1)).map((hour) => (
          <option key={hour} value={hour}>{hour}</option>
        ))}
      </select>
      <select
        aria-label="Minutos"
        value={parsed.minute}
        disabled={!parsed.hour}
        onChange={(event) => update(parsed.hour, event.target.value, parsed.period)}
        className="min-w-0 flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B] disabled:bg-slate-100"
      >
        {Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0')).map((minute) => (
          <option key={minute} value={minute}>{minute}</option>
        ))}
      </select>
      <div className="inline-flex shrink-0 rounded-lg border border-slate-300 p-0.5" role="group" aria-label="Período del día">
        {(['AM', 'PM'] as const).map((period) => (
          <button
            key={period}
            type="button"
            disabled={!parsed.hour}
            aria-pressed={parsed.period === period}
            onClick={() => update(parsed.hour, parsed.minute, period)}
            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors disabled:opacity-50 ${
              parsed.period === period ? 'bg-[#4E689B] text-white' : 'text-black/60 hover:bg-slate-100'
            }`}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
};