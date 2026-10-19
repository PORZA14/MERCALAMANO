import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CalendarSection } from './components/CalendarSection';
import { ToolsSection } from './components/ToolsSection';
import { TrackingSection } from './components/TrackingSection';
import { DrivesSection } from './components/DrivesSection';
import { HistorySection } from './components/HistorySection';
import { FeaturedMembersSection } from './components/FeaturedMembersSection';
import { Footer } from './components/Footer';
import { ChatbotWidget } from './components/ChatbotWidget';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { fetchPublicData, verifyAuth, type PublicDataPayload } from './api/client';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<PublicDataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPublicData();
      setData(res);
    } catch (err: unknown) {
      console.error('Error fetching public data:', err);
      const msg = err instanceof Error ? err.message : 'Error al conectar con el servidor';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    verifyAuth().then(setIsAuthenticated);

    // Hash listener to open admin if #admin is in url
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [loadData]);

  const handleAdminDataChanged = () => {
    loadData();
    verifyAuth().then(setIsAuthenticated);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#30456B] via-[#4E689B] to-[#7B9CC5] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white mb-4 animate-bounce shadow-lg">
          <span className="font-extrabold text-xl font-sans">PC</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">Merc a la Mano 2027</h2>
        <p className="text-xs text-white/80 mt-1 font-medium">Partners Campus EAFIT • Cargando plataforma oficial...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFD] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-black mb-1">No se pudo cargar la plataforma</h2>
        <p className="text-xs text-black/60 max-w-sm mb-4">{error}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#30456B] transition-colors shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reintentar conexión</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-col selection:bg-[#90AED1]/30 selection:text-[#4E689B]">
      {/* 1. Barra de navegación */}
      <Navbar
        isAuthenticated={isAuthenticated}
        adminAvatarUrl={data?.siteConfig.adminProfile?.avatarUrl}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="flex-1">
        {/* 2. Hero principal */}
        {data && <Hero config={data.siteConfig} />}

        {/* 3. Calendario de Mercadeo */}
        {data && (
          <CalendarSection
            events={data.events}
            config={data.siteConfig}
          />
        )}

        {/* 4. Centro de herramientas */}
        {data && <ToolsSection tools={data.tools} />}

        {/* 5. Seguimiento MERC */}
        {data && <TrackingSection meetings={data.meetings} config={data.siteConfig} />}

        {/* 6. Drives por comités 2027 */}
        {data && <DrivesSection drives={data.committeeDrives} />}

        {/* 7. Archivo histórico de carpetas por años */}
        {data && <HistorySection archives={data.historyArchives} />}

        {/* 8. Nueva sección: Miembros destacados del mes */}
        {data && <FeaturedMembersSection members={data.featuredMembers || []} />}
      </main>

      {/* 9. Pie de página */}
      <Footer lastUpdated={data?.siteConfig.lastUpdated} />

      {/* 10. Asistente Virtual n8n */}
      <ChatbotWidget
        config={data?.siteConfig.chatbot}
        adminAvatarUrl={data?.siteConfig.adminProfile?.avatarUrl}
      />

      {/* Panel Administrativo Privado */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          if (window.location.hash === '#admin') {
            history.pushState('', document.title, window.location.pathname + window.location.search);
          }
        }}
        onDataChanged={handleAdminDataChanged}
      />
    </div>
  );
}
