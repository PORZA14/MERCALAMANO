import React from 'react';
import { CalendarPlus, Download } from 'lucide-react';
import {
  downloadAppleCalendarFile,
  openGoogleCalendar,
  type CalendarExportItem,
} from '../utils/calendarExport';

interface AddToCalendarButtonsProps {
  item: CalendarExportItem;
  compact?: boolean;
}

export const AddToCalendarButtons: React.FC<AddToCalendarButtonsProps> = ({
  item,
  compact = false,
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <button
      type="button"
      onClick={() => openGoogleCalendar(item)}
      title="Agregar a Google Calendar"
      className={`inline-flex items-center gap-1.5 rounded-lg bg-[#4E689B] font-semibold text-white hover:bg-[#3B527E] transition-colors ${compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-2 text-xs'}`}
    >
      <CalendarPlus className="w-3.5 h-3.5" />
      Google Calendar
    </button>
    <button
      type="button"
      onClick={() => downloadAppleCalendarFile(item)}
      title="Descargar para Apple Calendar"
      className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-black/75 hover:bg-slate-50 transition-colors ${compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-2 text-xs'}`}
    >
      <Download className="w-3.5 h-3.5" />
      Apple Calendar
    </button>
  </div>
);