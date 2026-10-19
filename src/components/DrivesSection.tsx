import React from 'react';
import { ExternalLink, FolderGit2, FolderOpen, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { CommitteeDrive } from '../types';
import { renderIcon } from '../utils/icons';
import { MotionReveal } from './MotionReveal';

interface DrivesSectionProps {
  drives: CommitteeDrive[];
}

export const DrivesSection: React.FC<DrivesSectionProps> = ({ drives }) => {
  return (
    <section id="drives-comites" className="py-12 sm:py-16 bg-gradient-to-b from-[#F8FAFD] via-[#EEF4FB] to-[#E3EDF8] scroll-mt-20 relative overflow-hidden">
      {/* Decorative ambient lights */}
      <div
        className="absolute top-1/3 -right-16 w-80 h-80 bg-[#4E689B]/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-10 w-80 h-80 bg-[#FD7C5E]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <MotionReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#4E689B] text-xs font-bold uppercase tracking-wider mb-2 border border-[#90AED1]/30 shadow-2xs">
              <FolderGit2 className="w-3.5 h-3.5 text-[#FD7C5E]" />
              <span>Almacenamiento Compartido</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4E689B] tracking-tight mb-1.5">
              Drives por comités 2027
            </h2>
            <p className="text-xs sm:text-sm text-black/75 font-normal">
              Cada equipo, con sus recursos y carpetas oficiales organizados en un solo lugar.
            </p>
          </div>
        </MotionReveal>

        {/* 6 Committee Drive Cards with balanced compact proportions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {drives.map((drive, index) => {
            const isMercadeo = drive.name.toLowerCase().includes('mercadeo');
            const isRRPP = drive.name.toLowerCase().includes('relaciones');

            let cardBg = 'bg-white/95 border-[#90AED1]/35 hover:border-[#4E689B]';
            let iconBg = 'bg-[#4E689B]/10 text-[#4E689B] group-hover:bg-[#4E689B] group-hover:text-white';
            let topStripe = 'bg-[#90AED1]';

            if (isMercadeo) {
              cardBg = 'bg-gradient-to-br from-white via-white to-[#4E689B]/10 border-[#4E689B]/50 hover:border-[#4E689B] shadow-xs';
              iconBg = 'bg-[#4E689B] text-white';
              topStripe = 'bg-[#4E689B]';
            } else if (isRRPP) {
              cardBg = 'bg-gradient-to-br from-white via-white to-[#FD7C5E]/5 border-[#FD7C5E]/35 hover:border-[#FD7C5E]';
              iconBg = 'bg-[#FD7C5E]/15 text-[#FD7C5E] group-hover:bg-[#FD7C5E] group-hover:text-white';
              topStripe = 'bg-[#FD7C5E]';
            }

            return (
              <MotionReveal key={drive.id} delay={index * 50} direction="up">
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className={`relative group rounded-2xl p-4 sm:p-5 border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full ${cardBg}`}
                >
                  {/* Subtle top indicator line */}
                  <div className={`absolute top-0 left-5 right-5 h-1 rounded-b-full ${topStripe}`} />

                  <div>
                    <div className="flex items-center justify-between mb-3 pt-0.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xs ${iconBg}`}
                      >
                        {renderIcon(drive.icon, 'w-5 h-5')}
                      </div>
                      <span className="text-[11px] font-semibold text-black/40 flex items-center gap-0.5 group-hover:text-[#4E689B] transition-colors">
                        <span>Drive</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-black group-hover:text-[#4E689B] transition-colors mb-1">
                      {drive.name}
                    </h3>
                    <p className="text-xs text-black/70 leading-relaxed font-normal mb-5">
                      {drive.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <a
                      href={drive.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#90AED1]/45 text-[#4E689B] hover:bg-[#4E689B] hover:text-white hover:border-[#4E689B] text-xs font-bold transition-all duration-150 shadow-2xs group/btn"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Abrir carpeta</span>
                      <ExternalLink className="w-3 h-3 opacity-70 transition-transform group-hover/btn:translate-x-0.5" />
                    </a>
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
