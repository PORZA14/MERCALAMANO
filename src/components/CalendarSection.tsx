import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  X,
  Tag,
  RotateCcw,
  Info,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CalendarEvent, EventCategory, SiteConfig } from '../types';
import {
  MONTH_NAMES,
  DAYS_OF_WEEK,
  getMonthMatrix,
  formatEventDate,
  EVENT_CATEGORIES,
  resolveInitialCalendarState,
  getBogotaCurrentDate,
} from '../utils/calendar';
import { MotionReveal } from './MotionReveal';

interface CalendarSectionProps {
  events: CalendarEvent[];
  config: SiteConfig | null;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  events,
  config,
}) => {
  const initial = useMemo(() => resolveInitialCalendarState(config), [config]);

  // View state
  const [viewYear, setViewYear] = useState<number>(initial.year);
  const [viewMonth, setViewMonth] = useState<number>(initial.month);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Sync initial view when configuration updates
  useEffect(() => {
    setViewYear(initial.year);
    setViewMonth(initial.month);
  }, [initial.year, initial.month]);

  const bogotaDate = useMemo(() => getBogotaCurrentDate(), []);

  // Filter events by category
  const filteredEvents = useMemo(() => {
    if (activeCategoryFilter === 'all') return events;
    return events.filter((e) => e.category === activeCategoryFilter);
  }, [events, activeCategoryFilter]);

  // Matrix calculation for the active year and month
  const matrix = useMemo(() => {
    return getMonthMatrix(viewYear, viewMonth, filteredEvents);
  }, [viewYear, viewMonth, filteredEvents]);

  // Events strictly in the viewed month & year
  const currentMonthEvents = useMemo(() => {
    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    return filteredEvents
      .filter((e) => e.date.startsWith(monthPrefix))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [viewYear, viewMonth, filteredEvents]);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleResetToInitial = () => {
    setViewYear(initial.year);
    setViewMonth(initial.month);
  };

  const isNavigatedAway = viewYear !== initial.year || viewMonth !== initial.month;
  const isCurrentRealMonth =
    viewYear === bogotaDate.year && viewMonth === bogotaDate.month;

  const yearOptions = [2025, 2026, 2027, 2028, 2029];

  // Helper to count events in any month for the current view year
  const getEventCountForMonth = (monthIdx: number) => {
    const prefix = `${viewYear}-${String(monthIdx + 1).padStart(2, '0')}`;
    return filteredEvents.filter((e) => e.date.startsWith(prefix)).length;
  };

  return (
    <section id="calendario" className="py-12 sm:py-16 bg-gradient-to-b from-[#EEF4FB] via-[#E2ECF7] to-[#F4F7FC] scroll-mt-20 relative overflow-hidden">
      {/* Decorative ambient lights */}
      <div
        className="absolute top-10 right-10 w-80 h-80 bg-[#4E689B]/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-10 w-80 h-80 bg-[#FD7C5E]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <MotionReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#4E689B] text-xs font-bold uppercase tracking-wider mb-2 border border-[#90AED1]/30 shadow-2xs">
                <CalendarIcon className="w-3.5 h-3.5 text-[#FD7C5E]" />
                <span>Cronograma del Comité</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4E689B] tracking-tight">
                Calendario de Mercadeo
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-black/75 max-w-xl font-normal">
                Consulta y planifica publicaciones, reuniones, activaciones y fechas importantes.
              </p>
            </div>

            {/* View status & reset button */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              {isNavigatedAway ? (
                <button
                  onClick={handleResetToInitial}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#4E689B] text-white hover:bg-[#3B527E] transition-all duration-150 shadow-xs active:scale-95"
                >
                  <RotateCcw className="w-3 h-3 text-[#FD7C5E]" />
                  <span>Restablecer vista ({initial.modeLabel})</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 border border-[#90AED1]/30 text-[11px] font-semibold text-black/70 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#FD7C5E] animate-pulse"></span>
                  <span>Vista actual: {initial.modeLabel}</span>
                </div>
              )}
            </div>
          </div>
        </MotionReveal>

        {/* Month Selector Carousel / Tabs with active Motion Indicator */}
        <MotionReveal delay={80} direction="up">
          <div className="mb-4 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1 min-w-max p-1.5 bg-white/90 backdrop-blur-md border border-[#90AED1]/30 rounded-2xl shadow-xs">
              {MONTH_NAMES.map((name, index) => {
                const isSelected = viewMonth === index;
                const isInitialMonth =
                  initial.month === index && initial.year === viewYear;
                const monthEventsCount = getEventCountForMonth(index);

                return (
                  <button
                    key={name}
                    onClick={() => setViewMonth(index)}
                    className={`relative px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'text-white'
                        : 'text-black/70 hover:text-[#4E689B] hover:bg-[#90AED1]/10'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeMonthPill"
                        className="absolute inset-0 bg-gradient-to-r from-[#4E689B] to-[#5B79AD] rounded-xl shadow-xs"
                        transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span>{name}</span>
                      {monthEventsCount > 0 && (
                        <span
                          className={`w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center ${
                            isSelected
                              ? 'bg-white text-[#4E689B]'
                              : 'bg-[#90AED1]/30 text-[#4E689B]'
                          }`}
                        >
                          {monthEventsCount}
                        </span>
                      )}
                      {isInitialMonth && !isSelected && (
                        <span
                          title="Mes inicial"
                          className="w-1.5 h-1.5 rounded-full bg-[#FD7C5E]"
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </MotionReveal>

        {/* Calendar Box with Institutional Gradient Header */}
        <MotionReveal delay={120} direction="up">
          <div className="bg-white rounded-2xl border border-[#90AED1]/35 shadow-sm overflow-hidden">
            {/* Header banner with visible institutional gradient */}
            <div className="bg-gradient-to-r from-[#3B527E] via-[#4E689B] to-[#7497C4] p-3.5 sm:p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  aria-label="Mes anterior"
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white text-white hover:text-[#4E689B] transition-colors active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight">
                    {MONTH_NAMES[viewMonth]}
                  </h3>

                  {/* Year selector stepper/dropdown */}
                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(Number(e.target.value))}
                    className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg border border-white/30 focus:outline-none focus:ring-1 focus:ring-white cursor-pointer"
                  >
                    {yearOptions.map((yr) => (
                      <option key={yr} value={yr} className="text-black bg-white">
                        {yr}
                      </option>
                    ))}
                  </select>

                  {isCurrentRealMonth && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FD7C5E] text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                      <Sparkles className="w-2.5 h-2.5" /> Mes Actual
                    </span>
                  )}
                </div>

                <button
                  onClick={handleNextMonth}
                  aria-label="Mes siguiente"
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white text-white hover:text-[#4E689B] transition-colors active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-white/90 font-medium flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-white" /> Categoría:
                </span>
                <select
                  value={activeCategoryFilter}
                  onChange={(e) => setActiveCategoryFilter(e.target.value)}
                  className="text-xs font-bold bg-white text-black border border-white/40 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-[#FD7C5E]"
                >
                  <option value="all">Todas ({events.length})</option>
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Weekday headers in deep navy */}
            <div className="grid grid-cols-7 bg-[#30456B] text-white text-center py-2 text-[11px] font-bold tracking-wider">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Days cells: compact, balanced proportions */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#90AED1]/20">
              {matrix.map((cell, idx) => {
                const hasEvents = cell.events.length > 0;
                return (
                  <div
                    key={`${cell.dateString}-${idx}`}
                    className={`min-h-[64px] sm:min-h-[82px] p-1.5 sm:p-2 transition-colors flex flex-col justify-between ${
                      cell.isCurrentMonth
                        ? 'bg-white hover:bg-[#F0F5FA]'
                        : 'bg-[#F9FBFC] text-black/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold rounded-md w-5 h-5 flex items-center justify-center ${
                          cell.isToday
                            ? 'bg-[#FD7C5E] text-white font-extrabold shadow-2xs'
                            : cell.isCurrentMonth
                            ? 'text-black'
                            : 'text-black/30'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {hasEvents && (
                        <span className="text-[10px] text-[#4E689B] font-bold px-1.5 py-0.2 rounded-full bg-[#90AED1]/20">
                          {cell.events.length}
                        </span>
                      )}
                    </div>

                    {/* Events list within cell */}
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-12">
                      {cell.events.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          style={{
                            backgroundColor: `${event.color}15`,
                            borderLeftColor: event.color,
                          }}
                          className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium text-black truncate border-l-2 hover:opacity-85 transition-opacity block cursor-pointer"
                          title={event.title}
                        >
                          <span className="truncate">{event.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </MotionReveal>

        {/* Empty month message if no activities */}
        {currentMonthEvents.length === 0 && (
          <MotionReveal delay={160} direction="up">
            <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-xs border border-[#90AED1]/30 text-center max-w-lg mx-auto shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#4E689B]/10 flex items-center justify-center mx-auto mb-2 text-[#4E689B]">
                <Info className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-black">
                Todavía no hay actividades programadas para este mes
              </p>
              <p className="text-xs text-black/60 mt-0.5">
                Las reuniones, entregas y publicaciones se irán actualizando oportunamente.
              </p>
            </div>
          </MotionReveal>
        )}

        {/* Month Agenda View / Summary Cards */}
        {currentMonthEvents.length > 0 && (
          <MotionReveal delay={160} direction="up">
            <div className="mt-6">
              <h4 className="text-xs sm:text-sm font-bold text-[#4E689B] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FD7C5E]"></span>
                <span>Actividades de {MONTH_NAMES[viewMonth]} {viewYear}</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentMonthEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="p-3.5 rounded-xl border border-[#90AED1]/30 bg-white hover:border-[#4E689B] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                          style={{
                            backgroundColor: `${evt.color}15`,
                            color: evt.color === '#FFFFFF' ? '#000000' : evt.color,
                          }}
                        >
                          {evt.category}
                        </span>
                        <span className="text-[11px] font-semibold text-black/60">
                          {evt.date}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-black mb-1 line-clamp-1 group-hover:text-[#4E689B] transition-colors">
                        {evt.title}
                      </h5>
                      {evt.description && (
                        <p className="text-[11px] text-black/70 line-clamp-2 leading-relaxed">
                          {evt.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#4E689B] font-semibold">
                      <span>Ver detalles</span>
                      {evt.link && <ExternalLink className="w-3 h-3 text-[#FD7C5E]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MotionReveal>
        )}

        {/* Event Detail Modal with AnimatePresence */}
        <AnimatePresence>
          {selectedEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#90AED1]/30 relative"
              >
                <button
                  onClick={() => setSelectedEvent(null)}
                  aria-label="Cerrar detalles del evento"
                  className="absolute top-4 right-4 p-1.5 rounded-xl text-black/50 hover:text-black hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${selectedEvent.color}18`,
                      color: selectedEvent.color,
                    }}
                  >
                    {selectedEvent.category}
                  </span>
                  <span className="text-xs font-medium text-black/60">
                    {formatEventDate(selectedEvent.date)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-black mb-2">
                  {selectedEvent.title}
                </h3>

                {selectedEvent.time && (
                  <div className="flex items-center gap-1.5 text-xs text-[#4E689B] font-semibold mb-3">
                    <Clock className="w-3.5 h-3.5 text-[#FD7C5E]" />
                    <span>Hora: {selectedEvent.time}</span>
                  </div>
                )}

                {selectedEvent.description ? (
                  <p className="text-xs text-black/80 whitespace-pre-line mb-4 bg-[#F4F7FB] p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                ) : (
                  <p className="text-xs text-black/50 italic mb-4">
                    Sin descripción detallada.
                  </p>
                )}

                {selectedEvent.link && (
                  <div className="mb-4">
                    <a
                      href={selectedEvent.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4E689B] text-white text-xs font-bold hover:bg-[#3B527E] transition-all shadow-xs"
                    >
                      <span>Abrir enlace de la actividad</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#FD7C5E]" />
                    </a>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-black/50">
                  <span>Partners Campus EAFIT</span>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-[#4E689B] hover:bg-[#90AED1]/10 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
