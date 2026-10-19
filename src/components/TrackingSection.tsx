import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  History,
  MapPin,
  Info,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  ListTodo,
  AlertCircle,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { MeetingRecord, NextMeetingConfig, SiteConfig, TaskItem } from '../types';
import { MotionReveal } from './MotionReveal';
import { formatEventDate } from '../utils/calendar';
import { AddToCalendarButtons } from './AddToCalendarButtons';

interface TrackingSectionProps {
  meetings: MeetingRecord[];
  config?: SiteConfig | null;
}

export const TrackingSection: React.FC<TrackingSectionProps> = ({
  meetings,
  config,
}) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    meetings[0]?.id || ''
  );

  const activeMeeting =
    meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  const nextMeeting: NextMeetingConfig | undefined = config?.nextMeeting;
  const isNextMeetingDefined = Boolean(
    nextMeeting &&
      nextMeeting.isDefined &&
      (nextMeeting.date || nextMeeting.location || nextMeeting.time)
  );

  return (
    <section id="seguimiento" className="py-12 sm:py-16 bg-gradient-to-b from-[#E3EDF8] via-[#EEF4FB] to-[#F8FAFD] scroll-mt-20 relative overflow-hidden">
      {/* Decorative ambient lights */}
      <div
        className="absolute top-1/3 -left-16 w-80 h-80 bg-[#4E689B]/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-80 h-80 bg-[#FD7C5E]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <MotionReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#4E689B] text-xs font-bold uppercase tracking-wider mb-2 border border-[#90AED1]/30 shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-[#FD7C5E]" />
                <span>Bitácora Oficial</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4E689B] tracking-tight">
                Seguimiento MERC
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-black/75 max-w-xl font-normal">
                Registro de acuerdos, avances, notas y coordinación de la próxima reunión del comité.
              </p>
            </div>

            {/* Session Selector Tabs / Dropdown */}
            {meetings.length > 1 && (
              <div className="flex items-center gap-2 self-start md:self-auto bg-white p-1.5 rounded-xl border border-[#90AED1]/35 shadow-2xs">
                <History className="w-3.5 h-3.5 text-[#4E689B] ml-1.5" />
                <label htmlFor="meeting-select" className="text-xs font-bold text-black/70">
                  Sesión:
                </label>
                <select
                  id="meeting-select"
                  value={selectedMeetingId}
                  onChange={(e) => setSelectedMeetingId(e.target.value)}
                  className="text-xs font-semibold bg-[#F4F7FB] border border-[#90AED1]/30 rounded-lg px-2.5 py-1 text-black focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                >
                  {meetings.map((m, index) => (
                    <option key={m.id} value={m.id}>
                      {index === 0 ? 'Última: ' : ''} {m.date} — {m.title.slice(0, 28)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </MotionReveal>

        {/* Content Layout: Main Meeting on Left (8 cols) & Dedicated Próxima Reunión Card on Right (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Meeting Record Card (8 cols) */}
          <div className="lg:col-span-8">
            <MotionReveal delay={80} direction="up">
              {activeMeeting ? (
                <div className="bg-white rounded-2xl border border-[#90AED1]/35 shadow-xs overflow-hidden">
                  {/* Compact Header with institutional gradient */}
                  <div className="bg-gradient-to-r from-[#3B527E] via-[#4E689B] to-[#7497C4] p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold text-white mb-1">
                        <Calendar className="w-3 h-3 text-[#FD7C5E]" />
                        <span>Sesión del: {activeMeeting.date}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold tracking-tight">
                        {activeMeeting.title}
                      </h3>
                      <div className="mt-2">
                        <AddToCalendarButtons
                          compact
                          item={{
                            title: activeMeeting.title,
                            date: activeMeeting.date,
                            description: activeMeeting.summary,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Resumen */}
                    <div className="bg-[#F0F5FA] p-3.5 rounded-xl border border-[#90AED1]/25">
                      <h4 className="text-xs font-bold text-[#4E689B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#4E689B]"></span>
                        Resumen de la reunión
                      </h4>
                      <p className="text-xs sm:text-sm text-black/85 leading-relaxed font-normal">
                        {activeMeeting.summary ||
                          'Espacio destinado a registrar los principales temas tratados, avances y decisiones de la reunión más reciente.'}
                      </p>
                    </div>

                    {/* Temas tratados & Decisiones side by side or stacked */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Temas tratados */}
                      {activeMeeting.topics && activeMeeting.topics.length > 0 && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-[#4E689B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#90AED1]"></span>
                            Temas tratados
                          </h4>
                          <div className="space-y-1.5">
                            {activeMeeting.topics.map((topic, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-1.5 text-xs text-black/85"
                              >
                                <span className="w-4 h-4 rounded bg-[#4E689B]/10 text-[#4E689B] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="leading-snug">{topic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Decisiones principales */}
                      {activeMeeting.decisions && activeMeeting.decisions.length > 0 && (
                        <div className="bg-[#FD7C5E]/5 p-3 rounded-xl border border-[#FD7C5E]/20">
                          <h4 className="text-xs font-bold text-[#FD7C5E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#FD7C5E]"></span>
                            Decisiones tomadas
                          </h4>
                          <div className="space-y-1.5">
                            {activeMeeting.decisions.map((decision, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-1.5 text-xs text-black/85"
                              >
                                <span className="w-4 h-4 rounded bg-[#FD7C5E]/20 text-[#FD7C5E] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                  ✓
                                </span>
                                <span className="leading-snug">{decision}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Compromisos & Tareas del comité (Action Items) */}
                    {activeMeeting.tasks && activeMeeting.tasks.length > 0 && (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                        <h4 className="text-xs font-bold text-[#4E689B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ListTodo className="w-3.5 h-3.5 text-[#FD7C5E]" />
                          Compromisos y tareas acordadas
                        </h4>
                        <div className="space-y-2">
                          {activeMeeting.tasks.map((task: TaskItem) => {
                            const isCompleted = task.status === 'completed';
                            const isInProgress = task.status === 'in_progress';

                            return (
                              <div
                                key={task.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2.5 rounded-lg bg-[#F8FAFD] border border-slate-100 text-xs"
                              >
                                <div className="flex items-start gap-2">
                                  <span
                                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                                      isCompleted
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : isInProgress
                                        ? 'bg-[#4E689B]/15 text-[#4E689B]'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}
                                  >
                                    {isCompleted ? '✓' : '•'}
                                  </span>
                                  <span className={`text-black/85 font-medium ${isCompleted ? 'line-through text-black/50' : ''}`}>
                                    {task.description}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] text-black/60 shrink-0">
                                  {task.assignee && (
                                    <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-[#4E689B]">
                                      <User className="w-3 h-3 text-[#FD7C5E]" />
                                      {task.assignee}
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className="text-black/50 font-normal">
                                      {task.dueDate}
                                    </span>
                                  )}
                                </div>
                                <AddToCalendarButtons
                                  compact
                                  item={{
                                    title: task.description,
                                    date: task.dueDate || activeMeeting.date,
                                    description: [
                                      `Tarea de la reunión: ${activeMeeting.title}`,
                                      task.assignee ? `Responsable: ${task.assignee}` : '',
                                      task.dueDate ? '' : 'Sin fecha límite definida; se agregó en la fecha de la reunión.',
                                    ].filter(Boolean).join('\n'),
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Notas importantes */}
                    {activeMeeting.notes && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <h4 className="text-xs font-bold text-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-[#FD7C5E]" />
                          Notas & recomendaciones
                        </h4>
                        <p className="text-xs text-black/75 whitespace-pre-line leading-relaxed font-normal">
                          {activeMeeting.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-white rounded-2xl border border-slate-200">
                  <p className="text-xs text-black/60">No hay reuniones registradas todavía.</p>
                </div>
              )}
            </MotionReveal>
          </div>

          {/* Dedicated PRÓXIMA REUNIÓN Card (4 cols) with energetic Salmón accents */}
          <div className="lg:col-span-4">
            <MotionReveal delay={120} direction="up">
              <div className="bg-white rounded-2xl border border-[#FD7C5E]/30 p-4 sm:p-5 shadow-xs relative overflow-hidden">
                {/* Accent top stripe */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FD7C5E]" />

                {/* Badge */}
                <div className="flex items-center justify-between mb-3.5 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FD7C5E] text-white text-[11px] font-extrabold uppercase tracking-widest shadow-2xs">
                    <Sparkles className="w-3 h-3" />
                    PRÓXIMA REUNIÓN
                  </span>
                </div>

                {isNextMeetingDefined ? (
                  <div className="space-y-3">
                    {/* Fecha */}
                    {nextMeeting?.date && (
                      <div className="flex items-start gap-2.5 bg-[#F8FAFD] p-2.5 rounded-xl border border-slate-200/80">
                        <div className="w-8 h-8 rounded-lg bg-[#4E689B]/10 text-[#4E689B] flex items-center justify-center shrink-0 mt-0.5">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider block">
                            Fecha
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-black">
                            {formatEventDate(nextMeeting.date)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Hora */}
                    {nextMeeting?.time && (
                      <div className="flex items-start gap-2.5 bg-[#F8FAFD] p-2.5 rounded-xl border border-slate-200/80">
                        <div className="w-8 h-8 rounded-lg bg-[#FD7C5E]/15 text-[#FD7C5E] flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider block">
                            Hora de inicio
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-black">
                            {nextMeeting.time}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Aula o Lugar */}
                    {nextMeeting?.location && (
                      <div className="flex items-start gap-2.5 bg-[#F8FAFD] p-2.5 rounded-xl border border-slate-200/80">
                        <div className="w-8 h-8 rounded-lg bg-[#90AED1]/20 text-[#4E689B] flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider block">
                            Aula o lugar
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-black">
                            {nextMeeting.location}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Instrucciones adicionales */}
                    {nextMeeting?.additionalNotes && (
                      <div className="p-2.5 bg-[#F0F5FA] rounded-xl border border-[#90AED1]/25">
                        <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider block mb-0.5">
                          Indicaciones
                        </span>
                        <p className="text-xs text-black/80 font-normal leading-relaxed">
                          {nextMeeting.additionalNotes}
                        </p>
                      </div>
                    )}
                    {nextMeeting?.date && (
                      <AddToCalendarButtons
                        item={{
                          title: 'Próxima reunión de Mercadeo',
                          date: nextMeeting.date,
                          time: nextMeeting.time,
                          description: nextMeeting.additionalNotes,
                          location: nextMeeting.location,
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="py-6 px-3 text-center bg-[#F8FAFD] rounded-xl border border-dashed border-slate-300">
                    <div className="w-9 h-9 rounded-full bg-[#FD7C5E]/10 text-[#FD7C5E] flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-black">
                      Próxima reunión por definir
                    </p>
                    <p className="text-[11px] text-black/60 mt-0.5">
                      El equipo directivo notificará oportunamente la fecha, hora y aula asignada.
                    </p>
                  </div>
                )}
              </div>
            </MotionReveal>
          </div>
        </div>
      </div>
    </section>
  );
};
