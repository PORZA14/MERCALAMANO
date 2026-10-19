import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Menu, X, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  isAuthenticated: boolean;
  adminAvatarUrl?: string;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  adminAvatarUrl,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('calendario');

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Track current section
      const sections = [
        'calendario',
        'herramientas',
        'seguimiento',
        'drives-comites',
        'archivo-historico',
        'destacados',
      ];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Calendario', href: '#calendario', id: 'calendario' },
    { label: 'Herramientas', href: '#herramientas', id: 'herramientas' },
    { label: 'Seguimiento MERC', href: '#seguimiento', id: 'seguimiento' },
    { label: 'Drives por comités', href: '#drives-comites', id: 'drives-comites' },
    { label: 'Archivo histórico', href: '#archivo-historico', id: 'archivo-historico' },
    { label: 'Destacados', href: '#destacados', id: 'destacados' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#90AED1]/30 py-2'
          : 'bg-white/90 backdrop-blur-sm border-b border-[#90AED1]/20 py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#4E689B] rounded-xl p-1"
            aria-label="Ir al inicio de Merc a la Mano 2027"
          >
            {/* Partners Campus Official Emblem / Foto de perfil del Administrador */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#4E689B] to-[#3B527E] flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0 overflow-hidden">
              {adminAvatarUrl ? (
                <img
                  src={adminAvatarUrl}
                  alt="Foto de perfil del Administrador"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm tracking-tight font-sans">PC</span>
                </div>
              )}
              {/* Círculo salmón superpuesto en la esquina inferior derecha */}
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#FD7C5E] ring-2 ring-white shadow-xs z-10 pointer-events-none" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-extrabold tracking-tight text-[#4E689B] leading-none uppercase font-sans">
                  PARTNERS CAMPUS
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FD7C5E]/15 text-[#FD7C5E] uppercase">
                  2027
                </span>
              </div>
              <span className="text-[11px] font-medium text-black/75 tracking-wider leading-tight mt-0.5">
                EAFIT <span className="text-[#4E689B] font-semibold">• Mercadeo a la Mano</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-[#4E689B] bg-[#90AED1]/15 font-bold'
                      : 'text-black/75 hover:text-[#4E689B] hover:bg-[#90AED1]/10'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#4E689B] rounded-full"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Admin CTA button */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenAdmin}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow-xs active:scale-95 ${
                isAuthenticated
                  ? 'bg-[#4E689B] text-white hover:bg-[#3B527E] focus:ring-[#4E689B]'
                  : 'bg-white border border-[#90AED1]/50 text-[#4E689B] hover:bg-[#90AED1]/15 hover:border-[#4E689B] focus:ring-[#4E689B]'
              }`}
            >
              {isAuthenticated ? (
                <>
                  {adminAvatarUrl ? (
                    <img
                      src={adminAvatarUrl}
                      alt="Avatar de Administrador"
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-[#FD7C5E]"
                    />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FD7C5E]" />
                  )}
                  <span>Panel Administrador</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#4E689B]" />
                  <span>Administrador</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenAdmin}
              aria-label="Abrir panel administrador"
              className={`p-2 rounded-xl text-xs font-medium border transition-colors ${
                isAuthenticated
                  ? 'bg-[#4E689B] text-white border-transparent'
                  : 'bg-white text-[#4E689B] border-[#90AED1]/40'
              }`}
            >
              {isAuthenticated ? (
                adminAvatarUrl ? (
                  <img
                    src={adminAvatarUrl}
                    alt="Avatar de Administrador"
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-white"
                  />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[#FD7C5E]" />
                )
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-black hover:bg-[#90AED1]/15 focus:outline-none focus:ring-2 focus:ring-[#4E689B] transition-colors"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#4E689B]" /> : <Menu className="w-5 h-5 text-black" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-[#90AED1]/20 bg-white/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-1 shadow-lg overflow-hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-black/80 hover:bg-[#90AED1]/15 hover:text-[#4E689B] transition-colors"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
