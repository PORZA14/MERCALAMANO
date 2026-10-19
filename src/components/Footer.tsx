import React from 'react';
import { ArrowUp, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterProps {
  lastUpdated?: string;
}

export const Footer: React.FC<FooterProps> = ({ lastUpdated }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <footer className="bg-gradient-to-r from-[#283957] via-[#374C72] to-[#4E689B] text-white border-t border-[#90AED1]/30 py-10 transition-colors relative overflow-hidden">
      {/* Decorative ambient halo */}
      <div
        className="absolute top-0 right-1/4 w-72 h-72 bg-[#FD7C5E]/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FD7C5E]"></span>
              <h4 className="text-lg font-extrabold tracking-tight text-white">
                Merc a la Mano 2027
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-white/80 max-w-md font-normal leading-relaxed">
              Una herramienta de organización del comité de Mercadeo de Partners Campus EAFIT.
            </p>
          </div>

          {/* Last updated and Back to top */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 text-xs text-white/80">
            {formattedDate && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20 text-white/90">
                <RefreshCw className="w-3.5 h-3.5 text-[#FD7C5E]" />
                <span>Última actualización: {formattedDate}</span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#4E689B] font-bold text-xs hover:bg-[#FD7C5E] hover:text-white transition-all duration-200 shadow-sm"
            >
              <span>Volver arriba</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-white/15 text-center text-[11px] text-white/60">
          <p>© 2027 Partners Campus EAFIT • Todo lo que necesita Mercadeo, en dos clics.</p>
        </div>
      </div>
    </footer>
  );
};
