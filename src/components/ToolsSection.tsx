import React from 'react';
import { ExternalLink, Sparkles, Compass, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { ToolItem } from '../types';
import { renderIcon } from '../utils/icons';
import { MotionReveal } from './MotionReveal';

interface ToolsSectionProps {
  tools: ToolItem[];
}

export const ToolsSection: React.FC<ToolsSectionProps> = ({ tools }) => {
  return (
    <section id="herramientas" className="py-12 sm:py-16 bg-gradient-to-b from-[#F4F7FC] via-[#EEF4FB] to-[#E3EDF8] scroll-mt-20 relative overflow-hidden">
      {/* Subtle institutional ambient lights */}
      <div
        className="absolute top-1/4 -right-16 w-80 h-80 bg-[#4E689B]/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -left-16 w-80 h-80 bg-[#FD7C5E]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <MotionReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#4E689B] text-xs font-bold uppercase tracking-wider mb-2 border border-[#90AED1]/30 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-[#FD7C5E]" />
              <span>Accesos Directos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4E689B] tracking-tight mb-1.5">
              Centro de herramientas
            </h2>
            <p className="text-xs sm:text-sm text-black/75 font-normal">
              Los recursos que necesitas para crear, organizar y comunicar en dos clics.
            </p>
          </div>
        </MotionReveal>

        {/* 7 Tools Grid with balanced compact proportions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {tools.map((tool, index) => {
            const isIdeaCard = tool.isHighlighted || tool.name.toLowerCase().includes('ideaci');
            const isManualCard = tool.name.toLowerCase().includes('manual');
            const isDriveCard = tool.name.toLowerCase().includes('drive');

            // Unique visual treatments within official palette
            let cardStyle = 'bg-white/95 border-[#90AED1]/35 hover:border-[#4E689B]';
            let iconStyle = 'bg-[#90AED1]/20 text-[#4E689B] group-hover:bg-[#4E689B] group-hover:text-white';
            let buttonStyle = 'bg-[#4E689B] text-white hover:bg-[#3B527E]';
            let topAccent = 'bg-gradient-to-r from-[#4E689B] to-[#90AED1]';

            if (isIdeaCard) {
              cardStyle = 'bg-gradient-to-br from-white via-white to-[#FD7C5E]/10 border-[#FD7C5E] ring-1 ring-[#FD7C5E]/30';
              iconStyle = 'bg-[#FD7C5E]/15 text-[#FD7C5E] group-hover:bg-[#FD7C5E] group-hover:text-white';
              buttonStyle = 'bg-[#FD7C5E] text-white hover:bg-[#e06649] shadow-xs hover:shadow-sm';
              topAccent = 'bg-[#FD7C5E]';
            } else if (isManualCard) {
              cardStyle = 'bg-gradient-to-br from-white to-[#F0F5FA] border-[#4E689B]/40 hover:border-[#4E689B]';
              topAccent = 'bg-[#4E689B]';
            } else if (isDriveCard) {
              cardStyle = 'bg-gradient-to-br from-[#4E689B]/5 to-white border-[#4E689B]/45 hover:border-[#4E689B]';
              topAccent = 'bg-gradient-to-r from-[#FD7C5E] to-[#4E689B]';
            }

            return (
              <MotionReveal key={tool.id} delay={index * 50} direction="up">
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className={`relative group rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 border shadow-xs hover:shadow-md h-full ${cardStyle}`}
                >
                  {/* Top accent line */}
                  <div className={`absolute top-0 left-5 right-5 h-1 rounded-b-full ${topAccent}`} />

                  {/* Special Salmon Badge for Ideación card */}
                  {isIdeaCard && (
                    <div className="absolute -top-2.5 right-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FD7C5E] text-white text-[10px] font-bold shadow-xs uppercase tracking-wider">
                        <Sparkles className="w-2.5 h-2.5" />
                        Iniciativa Abierta
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Icon & header */}
                    <div className="flex items-center justify-between mb-3 pt-0.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xs ${iconStyle}`}
                      >
                        {renderIcon(tool.icon, 'w-5 h-5')}
                      </div>

                      <span className="text-[11px] font-semibold text-black/40 flex items-center gap-0.5 group-hover:text-[#4E689B] transition-colors">
                        <span>Abrir</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-sm sm:text-base font-bold text-black group-hover:text-[#4E689B] transition-colors mb-1">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-black/70 leading-relaxed font-normal mb-4">
                      {tool.description}
                    </p>
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-2 border-t border-slate-100">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 shadow-2xs ${buttonStyle}`}
                    >
                      <span>{tool.buttonText || 'Abrir recurso'}</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
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
