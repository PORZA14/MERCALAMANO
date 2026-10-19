import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Quote,
  Calendar,
  Award,
  HeartHandshake,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { FeaturedMember } from '../types';
import { MONTH_NAMES } from '../utils/calendar';

interface FeaturedMembersSectionProps {
  members: FeaturedMember[];
}

export const FeaturedMembersSection: React.FC<FeaturedMembersSectionProps> = ({
  members = [],
}) => {
  // Filter only published members (already filtered in API, but double check)
  const publishedMembers = members.filter((m) => m.status === 'published');
  const count = publishedMembers.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Keep index within bounds if list changes
  useEffect(() => {
    if (currentIndex >= count && count > 0) {
      setCurrentIndex(count - 1);
    }
  }, [count, currentIndex]);

  const handleNext = useCallback(() => {
    if (count <= 1) return;
    setDirection('next');
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const handlePrev = useCallback(() => {
    if (count <= 1) return;
    setDirection('prev');
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  // Keyboard navigation when user is focused inside or hovers section
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    }
  };

  // Touch swipe handling for mobile
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const currentMember = count > 0 ? publishedMembers[currentIndex] : null;

  const slideVariants = {
    enter: (dir: 'next' | 'prev') => ({
      x: dir === 'next' ? 60 : -60,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 320, damping: 30 },
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 },
      },
    },
    exit: (dir: 'next' | 'prev') => ({
      x: dir === 'next' ? -60 : 60,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring' as const, stiffness: 320, damping: 30 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
      },
    }),
  };

  return (
    <section
      id="destacados"
      ref={sectionRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Sección Miembros Destacados del Mes"
      className="relative py-24 sm:py-32 overflow-hidden focus:outline-none bg-gradient-to-br from-[#1E293B] via-[#2D3E63] to-[#4E689B] text-white"
    >
      {/* Ambient Lighting & Decorative Depth Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft floating halo with brand colors */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#90AED1]/20 blur-3xl animate-ambient-slow"
          style={{ animationDuration: '24s' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#FD7C5E]/20 blur-3xl animate-ambient-slow"
          style={{ animationDuration: '28s', animationDelay: '-8s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#4E689B]/15 blur-3xl pointer-events-none" />

        {/* Elegant subtle geometric grid / lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          {/* Official Tag Capsule */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FD7C5E]/20 border border-[#FD7C5E]/40 text-[#FD7C5E] text-xs font-bold tracking-wider uppercase mb-5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>MIEMBROS DESTACADOS DEL MES</span>
          </motion.div>

          {/* Exact Main Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5"
          >
            Celebramos a quienes dejan huella.
          </motion.h2>

          {/* Exact Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-white/90 font-medium leading-relaxed"
          >
            “Cada integrante aporta algo único a Mercadeo. Este espacio es una
            oportunidad para reconocer y celebrar a quienes se destacan cada mes”.
          </motion.p>

          {/* Secondary Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xs sm:text-sm text-[#90AED1] font-normal mt-3 italic"
          >
            “Un reconocimiento especial dentro de un equipo en el que cada aporte cuenta”.
          </motion.p>
        </div>

        {/* Content Area: Carousel or Empty State */}
        {count === 0 ? (
          /* Empty State: Exact requested copy */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto p-8 sm:p-12 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 text-center shadow-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FD7C5E] to-[#4E689B] text-white flex items-center justify-center mx-auto mb-5 shadow-lg">
              <HeartHandshake className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              Reconocimiento mensual
            </h3>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-medium">
              “Muy pronto celebraremos nuevas historias de dedicación y creatividad”.
            </p>
            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-[#90AED1]">
              <Sparkles className="w-3.5 h-3.5 text-[#FD7C5E]" />
              <span>Espacio oficial de gratitud para el equipo de Mercadeo</span>
            </div>
          </motion.div>
        ) : (
          /* Carousel Experience */
          <div
            className="relative max-w-4xl mx-auto"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Slide Frame */}
            <div className="relative min-h-[420px] sm:min-h-[380px] overflow-hidden">
              <AnimatePresence custom={direction} mode="wait">
                {currentMember && (
                  <motion.div
                    key={currentMember.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-12"
                  >
                    {/* Portrait Photograph (Editorial Framing) */}
                    <div className="relative shrink-0 group">
                      {/* Decorative outer glow halo */}
                      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#FD7C5E]/40 via-[#90AED1]/30 to-white/20 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative w-48 h-56 sm:w-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl bg-slate-900/60">
                        {currentMember.photoUrl ? (
                          <img
                            src={currentMember.photoUrl}
                            alt={currentMember.name}
                            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white/40 bg-slate-800">
                            <User className="w-16 h-16 mb-2" />
                            <span className="text-xs">Sin fotografía</span>
                          </div>
                        )}

                        {/* Month badge overlay on mobile portrait */}
                        <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-[11px] font-semibold text-white/90 text-center md:hidden">
                          {MONTH_NAMES[currentMember.month - 1]?.toUpperCase()}{' '}
                          {currentMember.year}
                        </div>
                      </div>
                    </div>

                    {/* Member Information & Recognition */}
                    <div className="flex-1 text-center md:text-left flex flex-col justify-center min-w-0">
                      {/* Tag & Date Header */}
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FD7C5E] text-white shadow-xs">
                          <Award className="w-3.5 h-3.5" />
                          MIEMBRO DESTACADO
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white/90 border border-white/20">
                          <Calendar className="w-3.5 h-3.5 text-[#90AED1]" />
                          <span>
                            {MONTH_NAMES[currentMember.month - 1]?.toUpperCase()}{' '}
                            {currentMember.year}
                          </span>
                        </span>

                        {currentMember.badge && (
                          <span
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                            style={{
                              backgroundColor:
                                currentMember.badgeColor || '#4E689B',
                            }}
                          >
                            <Sparkles className="w-3 h-3 text-white" />
                            <span>{currentMember.badge}</span>
                          </span>
                        )}
                      </div>

                      {/* Member Full Name */}
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
                        {currentMember.name}
                      </h3>

                      {/* Member Role / Committee title */}
                      {currentMember.role && (
                        <p className="text-sm sm:text-base font-semibold text-[#90AED1] mb-4">
                          {currentMember.role}
                        </p>
                      )}

                      {/* Optional Recognition Message */}
                      {currentMember.quote && currentMember.quote.trim().length > 0 && (
                        <div className="relative mt-2 p-4 sm:p-5 rounded-2xl bg-black/25 border border-white/10 text-white/95 text-sm sm:text-base leading-relaxed">
                          <Quote className="w-6 h-6 text-[#FD7C5E]/60 absolute -top-3 -left-2 rotate-180" />
                          <p className="italic pl-2 font-medium">
                            “{currentMember.quote}”
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Controls (Shown only if count > 1) */}
            {count > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Position Indicator Pills */}
                <div className="flex items-center gap-2">
                  {publishedMembers.map((m, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setDirection(idx > currentIndex ? 'next' : 'prev');
                          setCurrentIndex(idx);
                        }}
                        aria-label={`Ir al reconocimiento de ${m.name} (${MONTH_NAMES[m.month - 1]} ${m.year})`}
                        className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FD7C5E] ${
                          isActive
                            ? 'w-8 bg-[#FD7C5E] shadow-xs'
                            : 'w-2.5 bg-white/30 hover:bg-white/60'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Counter & Arrow Buttons */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-white/70">
                    {currentIndex + 1} de {count}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      aria-label="Reconocimiento anterior"
                      className="p-3 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FD7C5E] shadow-xs"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={handleNext}
                      aria-label="Reconocimiento siguiente"
                      className="p-3 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FD7C5E] shadow-xs"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
