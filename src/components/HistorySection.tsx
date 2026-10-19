import React from 'react';
import { ExternalLink, Clock, FolderGit2, FolderLock } from 'lucide-react';
import { motion } from 'motion/react';
import type { HistoryArchive } from '../types';
import { MotionReveal } from './MotionReveal';

interface HistorySectionProps {
  archives: HistoryArchive[];
}

export const HistorySection: React.FC<HistorySectionProps> = ({ archives }) => {
  // Sort descending by year
  const sortedArchives = [...archives].sort((a, b) => b.year - a.year);

  return (
    <section id="archivo-historico" className="py-12 sm:py-16 bg-gradient-to-b from-[#E3EDF8] via-[#EEF4FB] to-[#F8FAFD] scroll-mt-20 relative overflow-hidden">
      {/* Decorative ambient lights */}
      <div
        className="absolute top-10 left-1/4 w-80 h-80 bg-[#4E689B]/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#FD7C5E]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with single requested description */}
        <MotionReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#4E689B] text-xs font-bold uppercase tracking-wider mb-2 shadow-2xs border border-[#90AED1]/30">
              <FolderGit2 className="w-3.5 h-3.5 text-[#FD7C5E]" />
              <span>Memoria Institucional</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4E689B] tracking-tight mb-1.5">
              Archivo histórico
            </h2>
            <p className="text-xs sm:text-sm text-black/75 font-normal leading-relaxed">
              Explora las carpetas de las generaciones anteriores de Mercadeo y consulta los materiales disponibles de cada año
            </p>
          </div>
        </MotionReveal>

        {/* Visual Cards Grid: Year as Protagonist with balanced proportions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {sortedArchives.map((item, index) => {
            const isPending = item.isPending || !item.url || item.url.trim().length === 0;

            const cardTheme = isPending
              ? 'pending'
              : index === 0
              ? 'featured' // Most recent year (2026)
              : index % 2 === 0
              ? 'azure'
              : 'white';

            return (
              <MotionReveal key={item.id} delay={index * 50} direction="up">
                <motion.div
                  whileHover={!isPending ? { y: -3 } : undefined}
                  transition={{ duration: 0.2 }}
                  className={`relative group rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between overflow-hidden border h-full ${
                    cardTheme === 'pending'
                      ? 'bg-white/80 border-dashed border-slate-300 shadow-2xs'
                      : cardTheme === 'featured'
                      ? 'bg-gradient-to-br from-[#4E689B] to-[#30456B] text-white border-[#4E689B] shadow-xs hover:shadow-md'
                      : cardTheme === 'azure'
                      ? 'bg-gradient-to-br from-white via-[#F0F5FA] to-[#E5EDF7] border-[#90AED1]/40 shadow-2xs hover:border-[#4E689B] hover:shadow-xs'
                      : 'bg-white border-[#90AED1]/30 shadow-2xs hover:border-[#4E689B] hover:shadow-xs'
                  }`}
                >
                  {/* Decorative background numeral watermark */}
                  <span
                    className={`absolute -right-2 -bottom-2 text-5xl font-extrabold select-none pointer-events-none tracking-tighter opacity-10 transition-transform duration-200 group-hover:scale-105 ${
                      cardTheme === 'featured' ? 'text-white' : 'text-[#4E689B]'
                    }`}
                    aria-hidden="true"
                  >
                    {item.year}
                  </span>

                  <div>
                    {/* Top status indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider ${
                          cardTheme === 'featured'
                            ? 'text-[#90AED1]'
                            : isPending
                            ? 'text-black/40'
                            : 'text-[#4E689B]'
                        }`}
                      >
                        Gestión MERC
                      </span>

                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FD7C5E]/15 text-[#FD7C5E] text-[10px] font-bold border border-[#FD7C5E]/30">
                          <Clock className="w-3 h-3" />
                          <span>Enlace pendiente</span>
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            cardTheme === 'featured'
                              ? 'bg-[#FD7C5E] text-white shadow-2xs'
                              : 'bg-[#90AED1]/20 text-[#4E689B]'
                          }`}
                        >
                          {index === 0 ? 'Última gestión' : 'Disponible'}
                        </span>
                      )}
                    </div>

                    {/* Year as main visual protagonist */}
                    <div className="my-1">
                      <h3
                        className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-sans ${
                          cardTheme === 'featured'
                            ? 'text-white'
                            : isPending
                            ? 'text-black/40'
                            : 'text-[#4E689B]'
                        }`}
                      >
                        MERC {item.year}
                      </h3>
                      <p
                        className={`text-xs mt-1 font-medium ${
                          cardTheme === 'featured' ? 'text-white/80' : 'text-black/60'
                        }`}
                      >
                        {isPending
                          ? 'Carpeta en proceso de recopilación'
                          : `Recursos y campañas oficiales ${item.year}`}
                      </p>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-3.5 mt-3 border-t border-slate-100/50">
                    {isPending ? (
                      <button
                        disabled
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-black/40 text-xs font-semibold cursor-not-allowed border border-slate-200"
                      >
                        <FolderLock className="w-3.5 h-3.5 text-black/30" />
                        <span>No disponible aún</span>
                      </button>
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 shadow-2xs group/btn ${
                          cardTheme === 'featured'
                            ? 'bg-[#FD7C5E] text-white hover:bg-[#e06649]'
                            : 'bg-white border border-[#90AED1]/40 text-[#4E689B] hover:bg-[#4E689B] hover:text-white'
                        }`}
                      >
                        <span>Abrir carpeta {item.year}</span>
                        <ExternalLink className="w-3 h-3 opacity-80 transition-transform group-hover/btn:translate-x-0.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
