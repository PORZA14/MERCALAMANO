import React from 'react';
import { Calendar, Compass, ArrowRight, Sparkles, FolderGit2, FileText, CheckCircle2 } from 'lucide-react';
import type { SiteConfig } from '../types';
import { MotionReveal } from './MotionReveal';
import { motion } from 'motion/react';

interface HeroProps {
  config: SiteConfig;
}

export const Hero: React.FC<HeroProps> = ({ config }) => {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#30456B] via-[#4E689B] to-[#7B9CC5] text-white py-12 sm:py-16 md:py-20 border-b border-[#90AED1]/30">
      {/* Decorative visible institutional glowing light halos with ambient float */}
      <div
        className="absolute -top-24 -right-16 w-96 h-96 bg-[#FD7C5E]/25 rounded-full blur-3xl pointer-events-none animate-ambient-float"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-16 w-96 h-96 bg-[#90AED1]/40 rounded-full blur-3xl pointer-events-none animate-ambient-float-delayed"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-white/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Modern subtle geometric matrix overlay */}
      <div
        className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:24px_24px] opacity-35 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Animated Badge */}
        <MotionReveal delay={30} direction="down">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 mb-4 shadow-sm hover:bg-white/25 transition-all duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FD7C5E] opacity-90"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FD7C5E]"></span>
            </span>
            <span className="text-[11px] font-bold text-white tracking-widest uppercase">
              Partners Campus EAFIT • Gestión 2027
            </span>
          </div>
        </MotionReveal>

        {/* Main Title */}
        <MotionReveal delay={80} direction="up">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 text-white drop-shadow-sm font-sans">
            {config.heroTitle || 'Merc a la Mano 2027'}
          </h1>
        </MotionReveal>

        {/* Subtitle with high-contrast clarity */}
        <MotionReveal delay={140} direction="up">
          <p className="text-lg sm:text-2xl md:text-3xl font-bold text-white/95 tracking-tight mb-3.5 max-w-2xl mx-auto leading-snug">
            {config.heroSubtitle || 'Todo lo que necesita Mercadeo, en dos clics.'}
          </p>
        </MotionReveal>

        {/* Description */}
        <MotionReveal delay={200} direction="up">
          <p className="text-xs sm:text-sm md:text-base text-white/85 max-w-xl mx-auto mb-7 font-normal leading-relaxed">
            {config.heroDescription ||
              'El centro de herramientas, recursos y organización del comité de Mercadeo de Partners Campus EAFIT.'}
          </p>
        </MotionReveal>

        {/* Action Buttons: Salmón #FD7C5E protagonist CTA + Crisp secondary */}
        <MotionReveal delay={260} direction="up">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollTo('#calendario')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl bg-[#FD7C5E] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:bg-[#e06649] transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#FD7C5E] focus:ring-offset-2 focus:ring-offset-[#4E689B]"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Consultar calendario</span>
              <ArrowRight className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollTo('#herramientas')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl bg-white text-[#4E689B] font-bold text-xs sm:text-sm hover:bg-[#F0F5FA] transition-all duration-200 shadow-md hover:shadow-lg group focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#4E689B]"
            >
              <Compass className="w-4 h-4 text-[#4E689B]" />
              <span>Explorar herramientas</span>
            </motion.button>
          </div>
        </MotionReveal>

        {/* Dynamic Quick Overview Feature Badges */}
        <MotionReveal delay={320} direction="up">
          <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15 text-white/95">
              <span className="w-2 h-2 rounded-full bg-[#FD7C5E]"></span>
              <span className="text-left text-[11px] sm:text-xs leading-tight">7 Herramientas activas</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15 text-white/95">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span className="text-left text-[11px] sm:text-xs leading-tight">Cronograma 2027</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15 text-white/95">
              <span className="w-2 h-2 rounded-full bg-[#90AED1]"></span>
              <span className="text-left text-[11px] sm:text-xs leading-tight">Bitácora & Acuerdos</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15 text-white/95">
              <span className="w-2 h-2 rounded-full bg-[#FD7C5E]"></span>
              <span className="text-left text-[11px] sm:text-xs leading-tight">Drives & Archivo</span>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
};
