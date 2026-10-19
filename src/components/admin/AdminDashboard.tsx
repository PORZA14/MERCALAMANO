import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  AlertCircle,
  Calendar,
  Compass,
  FileText,
  FolderGit2,
  Archive,
  Settings,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  Download,
  KeyRound,
  RotateCcw,
  MapPin,
  Sparkles,
  User,
  Award,
  Camera,
  Bot,
} from 'lucide-react';
import type {
  CalendarEvent,
  ToolItem,
  MeetingRecord,
  CommitteeDrive,
  HistoryArchive,
  SiteConfig,
  AuditLog,
  EventCategory,
  NextMeetingConfig,
  TaskItem,
  FeaturedMember,
  AdminProfile,
  ChatbotConfig,
} from '../../types';
import {
  AuthExpiredError,
  getStoredToken,
  removeStoredToken,
  loginAdmin,
  logoutAdmin,
  fetchAdminAll,
  updateSiteConfig,
  updateNextMeeting,
  changePassword,
  createEvent,
  updateEvent,
  deleteEvent,
  createTool,
  updateTool,
  deleteTool,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  createCommitteeDrive,
  updateCommitteeDrive,
  deleteCommitteeDrive,
  createHistoryArchive,
  updateHistoryArchive,
  deleteHistoryArchive,
  deleteFeaturedMember,
  exportBackup,
  updateChatbotConfig,
} from '../../api/client';
import {
  MONTH_NAMES,
  EVENT_CATEGORIES,
  OFFICIAL_COLORS,
  getBogotaCurrentDate,
} from '../../utils/calendar';
import { AVAILABLE_ICON_NAMES, renderIcon } from '../../utils/icons';
import { AdminProfileTab } from './AdminProfileTab';
import { AdminFeaturedMembersTab } from './AdminFeaturedMembersTab';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: (authenticated?: boolean) => void;
}

type AdminTab =
  | 'calendar'
  | 'tools'
  | 'tracking'
  | 'drives'
  | 'archives'
  | 'featured'
  | 'profile'
  | 'config'
  | 'logs';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('calendar');

  // Loading & notification states
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'event' | 'tool' | 'meeting' | 'drive' | 'archive' | 'member';
    id: string;
    name: string;
  } | null>(null);

  // Administrative loaded data
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [featuredMembers, setFeaturedMembers] = useState<FeaturedMember[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [drives, setDrives] = useState<CommitteeDrive[]>([]);
  const [archives, setArchives] = useState<HistoryArchive[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Editing forms state
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [editingTool, setEditingTool] = useState<Partial<ToolItem> | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Partial<MeetingRecord> | null>(null);
  const [editingDrive, setEditingDrive] = useState<Partial<CommitteeDrive> | null>(null);
  const [editingArchive, setEditingArchive] = useState<Partial<HistoryArchive> | null>(null);

  // Next meeting configuration state
  const [nextMeetingForm, setNextMeetingForm] = useState<NextMeetingConfig>({
    date: '',
    time: '',
    location: '',
    additionalNotes: '',
    isDefined: false,
  });

  // Chatbot configuration state
  const [chatbotForm, setChatbotForm] = useState<ChatbotConfig>({
    enabled: true,
    title: 'Asistente de Mercadeo',
    subtitle: 'Partners Campus EAFIT • n8n AI',
    welcomeMessage:
      '¡Hola! Soy el asistente virtual de Mercadeo de Partners Campus. ¿En qué te puedo ayudar hoy con copies, ideas de diseño, contenido para redes o campañas?',
    webhookUrl:
      'https://porza.app.n8n.cloud/webhook/35e78195-181d-434a-94e4-ae1e2c1d9b6f/chat',
  });

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // Check initial authentication
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setCheckingAuth(true);
    if (!getStoredToken()) {
      setIsAuthenticated(false);
      setCheckingAuth(false);
      return;
    }
    loadAllAdminData().then((loaded) => {
      if (cancelled) return;
      if (loaded) onDataChanged(true);
      setCheckingAuth(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const loadAllAdminData = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetchAdminAll();
      setSiteConfig(res.siteConfig);
      if (res.siteConfig.nextMeeting) {
        setNextMeetingForm(res.siteConfig.nextMeeting);
      } else {
        setNextMeetingForm({ date: '', time: '', location: '', additionalNotes: '', isDefined: false });
      }
      setEvents(res.events);
      setTools(res.tools);
      setMeetings(res.meetings);
      setDrives(res.committeeDrives);
      setArchives(res.historyArchives);
      setFeaturedMembers(res.featuredMembers || []);
      setAdminProfile(res.siteConfig.adminProfile || null);
      if (res.siteConfig.chatbot) {
        setChatbotForm(res.siteConfig.chatbot);
      }
      setAuditLogs(res.auditLogs);
      setIsAuthenticated(true);
      return true;
    } catch (err: unknown) {
      if (err instanceof AuthExpiredError) {
        removeStoredToken();
        setIsAuthenticated(false);
        setErrorMsg(null);
        onDataChanged(false);
        return false;
      }
      const message = err instanceof Error ? err.message : 'Error al cargar datos del panel';
      showNotification(message, true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNextMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const isConfigured = Boolean(
        (nextMeetingForm.date && nextMeetingForm.date.trim().length > 0) ||
        (nextMeetingForm.location && nextMeetingForm.location.trim().length > 0) ||
        (nextMeetingForm.time && nextMeetingForm.time.trim().length > 0)
      );
      const payload: NextMeetingConfig = {
        ...nextMeetingForm,
        isDefined: isConfigured,
      };
      const updated = await updateNextMeeting(payload);
      setNextMeetingForm(updated);
      if (siteConfig) {
        setSiteConfig({ ...siteConfig, nextMeeting: updated });
      }
      showNotification('Configuración de la próxima reunión guardada con éxito');
      onDataChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar próxima reunión';
      showNotification(message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChatbot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await updateChatbotConfig(chatbotForm);
      setChatbotForm(updated);
      if (siteConfig) {
        setSiteConfig({ ...siteConfig, chatbot: updated });
      }
      showNotification('Configuración del asistente virtual guardada con éxito');
      onDataChanged();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al guardar configuración del chatbot';
      showNotification(message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    try {
      setLoading(true);
      await loginAdmin(passwordInput.trim());
      setIsAuthenticated(true);
      setPasswordInput('');
      onDataChanged(true);
      const loaded = await loadAllAdminData();
      if (loaded) showNotification('Inicio de sesión exitoso');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Contraseña incorrecta';
      showNotification(message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    onDataChanged(false);
    onClose();
  };

  // ---------------- EVENT HANDLERS ----------------
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.title || !editingEvent.date || !editingEvent.category) {
      showNotification('Título, fecha y categoría son obligatorios', true);
      return;
    }
    try {
      setLoading(true);
      if (editingEvent.id) {
        await updateEvent(editingEvent.id, editingEvent);
        showNotification('Evento actualizado con éxito');
      } else {
        await createEvent(editingEvent);
        showNotification('Evento creado con éxito');
      }
      setEditingEvent(null);
      void loadAllAdminData();
      onDataChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar evento';
      showNotification(message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setLoading(true);
      switch (deleteConfirm.type) {
        case 'event':
          await deleteEvent(deleteConfirm.id);
          showNotification('Evento eliminado');
          break;
        case 'tool':
          await deleteTool(deleteConfirm.id);
          showNotification('Herramienta eliminada');
          break;
        case 'meeting':
          await deleteMeeting(deleteConfirm.id);
          showNotification('Reunión eliminada');
          break;
        case 'drive':
          await deleteCommitteeDrive(deleteConfirm.id);
          showNotification('Drive de comité eliminado');
          break;
        case 'archive':
          await deleteHistoryArchive(deleteConfirm.id);
          showNotification('Archivo histórico eliminado');
          break;
        case 'member':
          await deleteFeaturedMember(deleteConfirm.id);
          showNotification('Reconocimiento eliminado con éxito');
          break;
      }
      setDeleteConfirm(null);
      void loadAllAdminData();
      onDataChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar';
      showNotification(message, true);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- INITIAL MONTH HANDLER ----------------
  const handleSetInitialMonthMode = async (mode: string) => {
    try {
      setLoading(true);
      const isAuto = mode === 'auto';
      const updated = await updateSiteConfig({
        calendarInitialMonthMode: mode,
        featuredMonth: isAuto ? (siteConfig?.featuredMonth ?? 0) : Number(mode),
      });
      setSiteConfig(updated);
      onDataChanged();
      showNotification(
        isAuto
          ? 'Mes inicial del calendario configurado en Automático (tiempo real)'
          : `Mes inicial del calendario configurado en: ${MONTH_NAMES[Number(mode)]} de 2027`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar mes inicial';
      showNotification(message, true);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- TOOL HANDLERS ----------------
  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool?.name || !editingTool.url) {
      showNotification('Nombre y URL son obligatorios', true);
      return;
    }
    // URL format validation
    try {
      new URL(editingTool.url);
    } catch {
      showNotification('La URL debe ser un enlace válido (ej: https://...)', true);
      return;
    }

    try {
      setLoading(true);
      if (editingTool.id) {
        await updateTool(editingTool.id, editingTool);
        showNotification('Herramienta actualizada');
      } else {
        await createTool(editingTool);
        showNotification('Herramienta creada');
      }
      setEditingTool(null);
      void loadAllAdminData();
      onDataChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar herramienta';
      showNotification(message, true);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- MEETING HANDLERS ----------------
  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting?.title || !editingMeeting.date) {
      showNotification('Fecha y título son obligatorios', true);
      return;
    }
    try {
      setLoading(true);
      if (editingMeeting.id) {
        await updateMeeting(editingMeeting.id, editingMeeting);
        showNotification('Reunión actualizada');
      } else {
        await createMeeting(editingMeeting);
        showNotification('Nueva reunión registrada');
      }
      setEditingMeeting(null);
      void loadAllAdminData();
      onDataChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar reunión';
      showNotification(message, true);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- COMMITTEE DRIVE HANDLERS ----------------
  const handleSaveDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDrive?.name || !editingDrive.url) {
      showNotification('Nombre y enlace son obligatorios', true);
      return;
    }
    try {
      new URL(editingDrive.url);
    } catch {
      showNotification('El enlace debe ser una URL válida', true);
      return;
    }
    try {
      setLoading(true);
      if (editingDrive.id) {
        await updateCommitteeDrive(editingDrive.id, editingDrive);
        showNotification('Drive de comité actualizado');
      } else {
        await createCommitteeDrive(editingDrive);
        showNotification('Comité añadido con éxito');
      }
      setEditingDrive(null);
      void loadAllAdminData();
      onDataChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      showNotification(message, true);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ARCHIVE HANDLERS ----------------
  const handleSaveArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArchive?.year) {
      showNotification('El año es obligatorio', true);
      return;
    }
    try {
      setLoading(true);
      const isPending = !editingArchive.url || editingArchive.url.trim().length === 0;
      const payload = {
        ...editingArchive,
        isPending,
      };

      if (editingArchive.id) {
        await updateHistoryArchive(editingArchive.id, payload);
        showNotification('Archivo histórico actualizado');
      } else {
        await createHistoryArchive(payload);
        showNotification('Generación histórica añadida');
      }
      setEditingArchive(null);
      void loadAllAdminData();
      onDataChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar archivo';
      showNotification(message, true);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SITE CONFIG HANDLER ----------------
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteConfig) return;
    try {
      setLoading(true);
      await updateSiteConfig(siteConfig);
      showNotification('Configuración general guardada');
      onDataChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar configuración';
      showNotification(message, true);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PASSWORD CHANGE ----------------
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) {
      showNotification('Ingresa la contraseña actual y la nueva', true);
      return;
    }
    if (newPw !== confirmPw) {
      showNotification('La nueva contraseña y su confirmación no coinciden', true);
      return;
    }
    if (newPw.length < 6) {
      showNotification('La nueva contraseña debe tener mínimo 6 caracteres', true);
      return;
    }
    try {
      setLoading(true);
      await changePassword(currentPw, newPw);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      showNotification('Contraseña actualizada con éxito');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar contraseña';
      showNotification(message, true);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EXPORT BACKUP ----------------
  const handleExportBackup = async () => {
    try {
      const backupData = await exportBackup();
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mercamano-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('Copia de seguridad descargada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al exportar';
      showNotification(message, true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-[#90AED1]/30 overflow-hidden relative animate-in zoom-in-95 duration-150">
        {/* Top bar */}
        <div className="px-6 py-4 bg-white border-b border-[#90AED1]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {isAuthenticated && adminProfile?.avatarUrl ? (
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="relative group focus:outline-none"
                title="Ver y editar Mi perfil"
              >
                <img
                  src={adminProfile.avatarUrl}
                  alt={adminProfile.name || 'Avatar Administrador'}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FD7C5E] shadow-xs group-hover:opacity-90 transition-opacity"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" />
              </button>
            ) : (
              <div
                onClick={() => isAuthenticated && setActiveTab('profile')}
                className={`w-10 h-10 rounded-xl bg-[#4E689B] text-white flex items-center justify-center shadow-xs ${
                  isAuthenticated ? 'cursor-pointer hover:bg-[#3B527E] transition-colors' : ''
                }`}
                title={isAuthenticated ? 'Ir a Mi perfil' : 'Panel Administrador'}
              >
                <ShieldCheck className="w-5 h-5 text-[#FD7C5E]" />
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-black tracking-tight leading-none">
                Panel de Administración • Merc a la Mano 2027
              </h2>
              <span className="text-xs text-black/60">
                {isAuthenticated && adminProfile?.name
                  ? `${adminProfile.name} • ${adminProfile.role || 'Partners Campus EAFIT'}`
                  : 'Gestión oficial del comité de Mercadeo de Partners Campus EAFIT'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-[#4E689B] text-white border-[#4E689B]'
                      : 'border-slate-200 text-black/70 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Mi perfil</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-black/70 hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar sesión</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar panel"
              className="p-2 rounded-xl text-black/50 hover:text-black hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Content Area */}
        {checkingAuth ? (
          <div className="flex-1 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-[#4E689B] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-black/60 font-medium">Verificando sesión...</p>
          </div>
        ) : !isAuthenticated ? (
          /* LOGIN FORM */
          <div className="flex-1 p-6 sm:p-12 flex items-center justify-center bg-slate-50/50">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#90AED1]/30 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#4E689B]/10 text-[#4E689B] flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-black">
                  Acceso Administrativo
                </h3>
                <p className="text-xs text-black/60 mt-1">
                  Introduce la contraseña institucional para administrar el sitio.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-black/80 mb-1.5"
                  >
                    Contraseña de Administrador
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Ingresa la contraseña..."
                      required
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B] focus:border-[#4E689B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-black/40 hover:text-black/70"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#4E689B] text-white font-semibold text-xs hover:bg-[#4E689B]/90 transition-colors shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Verificando...' : 'Iniciar Sesión'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-black/50">
                <span>Plataforma protegida con Row-Level Security y encriptación en servidor.</span>
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN INTERFACE */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-60 bg-slate-50 border-r border-[#90AED1]/20 p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
              <button
                onClick={() => {
                  setActiveTab('calendar');
                  setEditingEvent(null);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 text-left ${
                  activeTab === 'calendar'
                    ? 'bg-[#4E689B] text-white shadow-xs'
                    : 'text-black/70 hover:bg-slate-200/70'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendario 2027</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('tools');
                  setEditingTool(null);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 text-left ${
                  activeTab === 'tools'
                    ? 'bg-[#4E689B] text-white shadow-xs'
                    : 'text-black/70 hover:bg-slate-200/70'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Herramientas</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('tracking');
                  setEditingMeeting(null);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 text-left ${
                  activeTab === 'tracking'
                    ? 'bg-[#4E689B] text-white shadow-xs'
                    : 'text-black/70 hover:bg-slate-200/70'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Seguimiento MERC</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('drives');
                  setEditingDrive(null);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 text-left ${
                  activeTab === 'drives'
                    ? 'bg-[#4E689B] text-white shadow-xs'
                    : 'text-black/70 hover:bg-slate-200/70'
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                <span>Drives por comités</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('archives');
                  setEditingArchive(null);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 text-left ${
                  activeTab === 'archives'
                    ? 'bg-[#4E689B] text-white shadow-xs'
                    : 'text-black/70 hover:bg-slate-200/70'
                }`}
              >
                <Archive className="w-4 h-4" />
                <span>Archivo histórico</span>
              </button>

              <button
                onClick={() => setActiveTab('featured')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 text-left ${
                  activeTab === 'featured'
                    ? 'bg-[#4E689B] text-white shadow-xs'
                    : 'text-black/70 hover:bg-slate-200/70'
                }`}
              >
                <Award className="w-4 h-4 text-[#FD7C5E]" />
                <span>Miembros destacados</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 text-left ${
                  activeTab === 'profile'
                    ? 'bg-[#4E689B] text-white shadow-xs'
                    : 'text-black/70 hover:bg-slate-200/70'
                }`}
              >
                {adminProfile?.avatarUrl ? (
                  <img
                    src={adminProfile.avatarUrl}
                    alt=""
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-[#FD7C5E]"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>Mi perfil</span>
              </button>

              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 text-left ${
                  activeTab === 'config'
                    ? 'bg-[#4E689B] text-white shadow-xs'
                    : 'text-black/70 hover:bg-slate-200/70'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 text-left ${
                  activeTab === 'logs'
                    ? 'bg-[#4E689B] text-white shadow-xs'
                    : 'text-black/70 hover:bg-slate-200/70'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Registro de cambios</span>
              </button>

              <div className="hidden md:block mt-auto pt-4 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* TAB 1: CALENDARIO */}
              {activeTab === 'calendar' && (
                <div className="space-y-6">
                  {/* Initial Month Selector Card */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-[#F4F7FB] to-[#EEF3F9] border border-[#90AED1]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                    <div>
                      <h4 className="text-sm font-bold text-black flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FD7C5E]"></span>
                        <span>Mes inicial del calendario</span>
                      </h4>
                      <p className="text-xs text-black/70 mt-1 max-w-lg">
                        Elige si la página debe abrir automáticamente el mes y año actuales según la fecha real (Bogotá), o un mes específico fijado de 2027.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={siteConfig?.calendarInitialMonthMode ?? 'auto'}
                        onChange={(e) => handleSetInitialMonthMode(e.target.value)}
                        className="bg-white border border-[#90AED1]/40 rounded-xl px-3.5 py-2 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#4E689B] shadow-2xs"
                      >
                        <option value="auto">Automático: mostrar el mes y el año actuales</option>
                        {MONTH_NAMES.map((name, idx) => (
                          <option key={name} value={String(idx)}>
                            {name} de 2027
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Header & Add Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-black">
                        Actividades y Eventos 2027
                      </h3>
                      <p className="text-xs text-black/60">
                        {events.length} actividades registradas en total.
                      </p>
                    </div>

                    {!editingEvent && (
                      <button
                        onClick={() =>
                          setEditingEvent({
                            title: '',
                            date: getBogotaCurrentDate().dateString,
                            time: '',
                            description: '',
                            category: 'Publicaciones',
                            color: '#4E689B',
                            link: '',
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#4E689B]/90 transition-colors shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Añadir actividad</span>
                      </button>
                    )}
                  </div>

                  {/* Event Edit / Create Form */}
                  {editingEvent && (
                    <form
                      onSubmit={handleSaveEvent}
                      className="p-5 rounded-2xl border border-[#4E689B]/30 bg-slate-50 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="text-sm font-bold text-[#4E689B]">
                          {editingEvent.id ? 'Editar Actividad' : 'Nueva Actividad'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingEvent(null)}
                          className="text-xs text-black/50 hover:text-black font-semibold"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Título del evento *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingEvent.title || ''}
                            onChange={(e) =>
                              setEditingEvent({ ...editingEvent, title: e.target.value })
                            }
                            placeholder="Ej: Lanzamiento campaña convocatorias"
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Fecha del evento (cualquier fecha) *
                          </label>
                          <input
                            type="date"
                            required
                            value={editingEvent.date || getBogotaCurrentDate().dateString}
                            onChange={(e) =>
                              setEditingEvent({ ...editingEvent, date: e.target.value })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Hora (Opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: 16:00"
                            value={editingEvent.time || ''}
                            onChange={(e) =>
                              setEditingEvent({ ...editingEvent, time: e.target.value })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Categoría *
                          </label>
                          <select
                            value={editingEvent.category || 'Publicaciones'}
                            onChange={(e) => {
                              const cat = e.target.value as EventCategory;
                              const defaultColor =
                                EVENT_CATEGORIES.find((c) => c.name === cat)?.color ||
                                '#4E689B';
                              setEditingEvent({
                                ...editingEvent,
                                category: cat,
                                color: defaultColor,
                              });
                            }}
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          >
                            {EVENT_CATEGORIES.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Color identificador (Paleta Oficial)
                          </label>
                          <div className="flex items-center gap-2 pt-1">
                            {OFFICIAL_COLORS.map((col) => (
                              <button
                                key={col.hex}
                                type="button"
                                onClick={() =>
                                  setEditingEvent({ ...editingEvent, color: col.hex })
                                }
                                style={{ backgroundColor: col.hex }}
                                title={col.name}
                                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                                  editingEvent.color === col.hex
                                    ? 'border-black scale-110 shadow-xs'
                                    : 'border-transparent'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Enlace externo opcional
                          </label>
                          <input
                            type="url"
                            placeholder="https://..."
                            value={editingEvent.link || ''}
                            onChange={(e) =>
                              setEditingEvent({ ...editingEvent, link: e.target.value })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Descripción
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Detalles sobre los entregables, acuerdos o requerimientos..."
                            value={editingEvent.description || ''}
                            onChange={(e) =>
                              setEditingEvent({
                                ...editingEvent,
                                description: e.target.value,
                              })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingEvent(null)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-black/70 hover:bg-slate-100"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-1.5 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#4E689B]/90 transition-colors shadow-xs"
                        >
                          {loading ? 'Guardando...' : 'Guardar actividad'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Events List */}
                  <div className="space-y-2">
                    {events.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                        <p className="text-xs text-black/60">
                          Todavía no hay eventos registrados para 2027. Haz clic en "Añadir actividad" para registrar el primero.
                        </p>
                      </div>
                    ) : (
                      events
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map((evt) => (
                          <div
                            key={evt.id}
                            className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#90AED1]/20 hover:border-[#4E689B]/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: evt.color }}
                              />
                              <div>
                                <span className="text-xs font-bold text-black block">
                                  {evt.title}
                                </span>
                                <span className="text-[11px] text-black/60">
                                  {evt.date} {evt.time ? `• ${evt.time}` : ''} •{' '}
                                  <span className="font-medium text-[#4E689B]">
                                    {evt.category}
                                  </span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingEvent(evt)}
                                className="p-1.5 rounded-lg text-black/60 hover:text-[#4E689B] hover:bg-slate-100 transition-colors"
                                title="Editar actividad"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: 'event',
                                    id: evt.id,
                                    name: evt.title,
                                  })
                                }
                                className="p-1.5 rounded-lg text-black/60 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Eliminar actividad"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: HERRAMIENTAS */}
              {activeTab === 'tools' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-black">
                        Centro de Herramientas
                      </h3>
                      <p className="text-xs text-black/60">
                        Administra nombres, enlaces, iconos, orden y visibilidad de las tarjetas.
                      </p>
                    </div>

                    {!editingTool && (
                      <button
                        onClick={() =>
                          setEditingTool({
                            name: '',
                            description: '',
                            url: '',
                            buttonText: 'Abrir',
                            icon: 'Folder',
                            order: tools.length + 1,
                            isActive: true,
                            isHighlighted: false,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#4E689B]/90 transition-colors shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nueva herramienta</span>
                      </button>
                    )}
                  </div>

                  {editingTool && (
                    <form
                      onSubmit={handleSaveTool}
                      className="p-5 rounded-2xl border border-[#4E689B]/30 bg-slate-50 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="text-sm font-bold text-[#4E689B]">
                          {editingTool.id ? 'Editar Herramienta' : 'Nueva Herramienta'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingTool(null)}
                          className="text-xs text-black/50 hover:text-black font-semibold"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Nombre del recurso *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingTool.name || ''}
                            onChange={(e) =>
                              setEditingTool({ ...editingTool, name: e.target.value })
                            }
                            placeholder="Ej: Manual de marca"
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Texto del botón
                          </label>
                          <input
                            type="text"
                            value={editingTool.buttonText || ''}
                            onChange={(e) =>
                              setEditingTool({
                                ...editingTool,
                                buttonText: e.target.value,
                              })
                            }
                            placeholder="Ej: Abrir manual"
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Enlace (URL) *
                          </label>
                          <input
                            type="url"
                            required
                            value={editingTool.url || ''}
                            onChange={(e) =>
                              setEditingTool({ ...editingTool, url: e.target.value })
                            }
                            placeholder="https://..."
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Icono del catálogo
                          </label>
                          <select
                            value={editingTool.icon || 'Folder'}
                            onChange={(e) =>
                              setEditingTool({ ...editingTool, icon: e.target.value })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          >
                            {AVAILABLE_ICON_NAMES.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Orden de visualización
                          </label>
                          <input
                            type="number"
                            value={editingTool.order || 1}
                            onChange={(e) =>
                              setEditingTool({
                                ...editingTool,
                                order: Number(e.target.value),
                              })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Descripción
                          </label>
                          <textarea
                            rows={2}
                            value={editingTool.description || ''}
                            onChange={(e) =>
                              setEditingTool({
                                ...editingTool,
                                description: e.target.value,
                              })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-6 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-black/80">
                            <input
                              type="checkbox"
                              checked={editingTool.isActive ?? true}
                              onChange={(e) =>
                                setEditingTool({
                                  ...editingTool,
                                  isActive: e.target.checked,
                                })
                              }
                              className="w-4 h-4 rounded text-[#4E689B] focus:ring-[#4E689B]"
                            />
                            <span>Visible en la página pública</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#FD7C5E]">
                            <input
                              type="checkbox"
                              checked={Boolean(editingTool.isHighlighted)}
                              onChange={(e) =>
                                setEditingTool({
                                  ...editingTool,
                                  isHighlighted: e.target.checked,
                                })
                              }
                              className="w-4 h-4 rounded text-[#FD7C5E] focus:ring-[#FD7C5E]"
                            />
                            <span>Destacar con Salmón institucional (Ideación)</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingTool(null)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-black/70 hover:bg-slate-100"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-1.5 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#4E689B]/90 transition-colors shadow-xs"
                        >
                          {loading ? 'Guardando...' : 'Guardar herramienta'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Tools List */}
                  <div className="space-y-2">
                    {tools
                      .sort((a, b) => a.order - b.order)
                      .map((t) => (
                        <div
                          key={t.id}
                          className={`flex items-center justify-between p-3.5 rounded-xl bg-white border transition-colors ${
                            t.isActive
                              ? 'border-[#90AED1]/20 hover:border-[#4E689B]/50'
                              : 'border-dashed border-slate-300 bg-slate-50/60 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#90AED1]/15 text-[#4E689B] flex items-center justify-center">
                              {renderIcon(t.icon, 'w-4 h-4')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-black">
                                  {t.name}
                                </span>
                                {t.isHighlighted && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FD7C5E] text-white">
                                    Destacado
                                  </span>
                                )}
                                {!t.isActive && (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-black/60">
                                    Desactivada
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-black/60 line-clamp-1">
                                {t.url}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingTool(t)}
                              className="p-1.5 rounded-lg text-black/60 hover:text-[#4E689B] hover:bg-slate-100 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'tool',
                                  id: t.id,
                                  name: t.name,
                                })
                              }
                              className="p-1.5 rounded-lg text-black/60 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SEGUIMIENTO MERC */}
              {activeTab === 'tracking' && (
                <div className="space-y-6">
                  {/* Block: Configuración de la próxima reunión */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#F4F7FB] via-white to-[#EEF3F9] border border-[#FD7C5E]/30 shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FD7C5E]"></span>
                        <h4 className="text-xs font-bold text-black uppercase tracking-wider">
                          Configuración de la próxima reunión
                        </h4>
                      </div>
                      {nextMeetingForm.isDefined && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FD7C5E] text-white">
                          Programada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-black/65 mb-3.5">
                      Actualiza los datos de la próxima sesión (fecha, hora y aula o lugar) para que se reflejen de inmediato en la vista pública.
                    </p>

                    <form onSubmit={handleSaveNextMeeting} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Fecha de la reunión
                          </label>
                          <input
                            type="date"
                            value={nextMeetingForm.date || ''}
                            onChange={(e) =>
                              setNextMeetingForm({ ...nextMeetingForm, date: e.target.value })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Hora de la reunión
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: 10:00 a. m."
                            value={nextMeetingForm.time || ''}
                            onChange={(e) =>
                              setNextMeetingForm({ ...nextMeetingForm, time: e.target.value })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Aula o lugar
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Aula 38-101"
                            value={nextMeetingForm.location || ''}
                            onChange={(e) =>
                              setNextMeetingForm({ ...nextMeetingForm, location: e.target.value })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Información adicional (opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Traer computador cargado y propuestas para la parrilla"
                            value={nextMeetingForm.additionalNotes || ''}
                            onChange={(e) =>
                              setNextMeetingForm({
                                ...nextMeetingForm,
                                additionalNotes: e.target.value,
                              })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-black/80">
                          <input
                            type="checkbox"
                            checked={nextMeetingForm.isDefined}
                            onChange={(e) =>
                              setNextMeetingForm({
                                ...nextMeetingForm,
                                isDefined: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded text-[#FD7C5E] focus:ring-[#FD7C5E]"
                          />
                          <span>Mostrar como reunión programada en la página principal</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setNextMeetingForm({
                                date: '',
                                time: '',
                                location: '',
                                additionalNotes: '',
                                isDefined: false,
                              });
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-black/70 hover:bg-slate-100 transition-colors"
                          >
                            Limpiar / Por definir
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-1.5 rounded-xl bg-[#FD7C5E] text-white text-xs font-semibold hover:bg-[#e06649] transition-colors shadow-xs"
                          >
                            {loading ? 'Guardando...' : 'Guardar cambios'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-black">
                        Bitácora y Seguimiento de Reuniones
                      </h3>
                      <p className="text-xs text-black/60">
                        Registra nuevas sesiones, edita acuerdos y gestiona los compromisos del comité.
                      </p>
                    </div>

                    {!editingMeeting && (
                      <button
                        onClick={() =>
                          setEditingMeeting({
                            date: new Date().toISOString().slice(0, 10),
                            title: 'Reunión Ordinaria de Mercadeo',
                            summary: '',
                            topics: [''],
                            decisions: [''],
                            notes: '',
                            nextMeetingDate: '',
                            tasks: [],
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#4E689B]/90 transition-colors shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nueva sesión</span>
                      </button>
                    )}
                  </div>

                  {editingMeeting && (
                    <form
                      onSubmit={handleSaveMeeting}
                      className="p-5 rounded-2xl border border-[#4E689B]/30 bg-slate-50 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="text-sm font-bold text-[#4E689B]">
                          {editingMeeting.id ? 'Editar Sesión' : 'Registrar Nueva Sesión'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingMeeting(null)}
                          className="text-xs text-black/50 hover:text-black font-semibold"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Título de la sesión *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingMeeting.title || ''}
                            onChange={(e) =>
                              setEditingMeeting({
                                ...editingMeeting,
                                title: e.target.value,
                              })
                            }
                            placeholder="Ej: Sesión Quincenal de Planeación"
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Fecha de la sesión *
                          </label>
                          <input
                            type="date"
                            required
                            value={editingMeeting.date || ''}
                            onChange={(e) =>
                              setEditingMeeting({
                                ...editingMeeting,
                                date: e.target.value,
                              })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Resumen de la reunión
                          </label>
                          <textarea
                            rows={3}
                            value={editingMeeting.summary || ''}
                            onChange={(e) =>
                              setEditingMeeting({
                                ...editingMeeting,
                                summary: e.target.value,
                              })
                            }
                            placeholder="Principales temas tratados, avances y decisiones..."
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Notas importantes & recomendaciones
                          </label>
                          <textarea
                            rows={2}
                            value={editingMeeting.notes || ''}
                            onChange={(e) =>
                              setEditingMeeting({
                                ...editingMeeting,
                                notes: e.target.value,
                              })
                            }
                            placeholder="Recordatorios clave para el equipo..."
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Fecha de la próxima reunión
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: 2027-02-05 o Fecha pendiente de definir"
                            value={editingMeeting.nextMeetingDate || ''}
                            onChange={(e) =>
                              setEditingMeeting({
                                ...editingMeeting,
                                nextMeetingDate: e.target.value,
                              })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>
                      </div>

                      {/* Tasks Management inside meeting */}
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-black uppercase tracking-wider">
                            Compromisos / Tareas ({editingMeeting.tasks?.length || 0})
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newTasks = [
                                ...(editingMeeting.tasks || []),
                                {
                                  id: `task-${Date.now()}`,
                                  description: '',
                                  assignee: '',
                                  dueDate: '',
                                  status: 'pending' as const,
                                },
                              ];
                              setEditingMeeting({ ...editingMeeting, tasks: newTasks });
                            }}
                            className="text-xs font-semibold text-[#4E689B] hover:underline"
                          >
                            + Añadir tarea
                          </button>
                        </div>

                        <div className="space-y-2">
                          {editingMeeting.tasks?.map((task, tIdx) => (
                            <div
                              key={task.id || tIdx}
                              className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                            >
                              <div className="sm:col-span-5">
                                <input
                                  type="text"
                                  placeholder="Descripción de la tarea"
                                  value={task.description}
                                  onChange={(e) => {
                                    const next = [...(editingMeeting.tasks || [])];
                                    next[tIdx].description = e.target.value;
                                    setEditingMeeting({ ...editingMeeting, tasks: next });
                                  }}
                                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <input
                                  type="text"
                                  placeholder="Responsable"
                                  value={task.assignee || ''}
                                  onChange={(e) => {
                                    const next = [...(editingMeeting.tasks || [])];
                                    next[tIdx].assignee = e.target.value;
                                    setEditingMeeting({ ...editingMeeting, tasks: next });
                                  }}
                                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <select
                                  value={task.status}
                                  onChange={(e) => {
                                    const next = [...(editingMeeting.tasks || [])];
                                    next[tIdx].status = e.target.value as TaskItem['status'];
                                    setEditingMeeting({ ...editingMeeting, tasks: next });
                                  }}
                                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200"
                                >
                                  <option value="pending">Pendiente</option>
                                  <option value="in_progress">En progreso</option>
                                  <option value="completed">Completada</option>
                                </select>
                              </div>
                              <div className="sm:col-span-2 flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = (editingMeeting.tasks || []).filter(
                                      (_, idx) => idx !== tIdx
                                    );
                                    setEditingMeeting({ ...editingMeeting, tasks: next });
                                  }}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingMeeting(null)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-black/70 hover:bg-slate-100"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-1.5 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#4E689B]/90 transition-colors shadow-xs"
                        >
                          {loading ? 'Guardando...' : 'Guardar sesión'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Meetings List */}
                  <div className="space-y-3">
                    {meetings.map((m) => (
                      <div
                        key={m.id}
                        className="p-4 bg-white rounded-2xl border border-[#90AED1]/20 flex items-center justify-between hover:border-[#4E689B]/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-black">
                              {m.title}
                            </span>
                            <span className="text-[11px] text-[#4E689B] font-semibold px-2 py-0.5 rounded-full bg-[#90AED1]/15">
                              {m.date}
                            </span>
                          </div>
                          <p className="text-xs text-black/60 line-clamp-1">
                            {m.summary}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingMeeting(m)}
                            className="p-1.5 rounded-lg text-black/60 hover:text-[#4E689B] hover:bg-slate-100 transition-colors"
                            title="Editar sesión"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'meeting',
                                id: m.id,
                                name: `${m.title} (${m.date})`,
                              })
                            }
                            className="p-1.5 rounded-lg text-black/60 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Eliminar sesión"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: DRIVES POR COMITES */}
              {activeTab === 'drives' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-black">
                        Drives por Comités 2027
                      </h3>
                      <p className="text-xs text-black/60">
                        Administra los accesos oficiales a las carpetas de Google Drive de cada equipo.
                      </p>
                    </div>

                    {!editingDrive && (
                      <button
                        onClick={() =>
                          setEditingDrive({
                            name: '',
                            description: '',
                            url: '',
                            icon: 'Users',
                            order: drives.length + 1,
                            isActive: true,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#4E689B]/90 transition-colors shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Añadir comité</span>
                      </button>
                    )}
                  </div>

                  {editingDrive && (
                    <form
                      onSubmit={handleSaveDrive}
                      className="p-5 rounded-2xl border border-[#4E689B]/30 bg-slate-50 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="text-sm font-bold text-[#4E689B]">
                          {editingDrive.id ? 'Editar Drive de Comité' : 'Nuevo Drive'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingDrive(null)}
                          className="text-xs text-black/50 hover:text-black font-semibold"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Nombre del comité *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingDrive.name || ''}
                            onChange={(e) =>
                              setEditingDrive({ ...editingDrive, name: e.target.value })
                            }
                            placeholder="Ej: Relaciones Públicas"
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Icono
                          </label>
                          <select
                            value={editingDrive.icon || 'Folder'}
                            onChange={(e) =>
                              setEditingDrive({ ...editingDrive, icon: e.target.value })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          >
                            {AVAILABLE_ICON_NAMES.map((iconName) => (
                              <option key={iconName} value={iconName}>
                                {iconName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Enlace de Google Drive *
                          </label>
                          <input
                            type="url"
                            required
                            value={editingDrive.url || ''}
                            onChange={(e) =>
                              setEditingDrive({ ...editingDrive, url: e.target.value })
                            }
                            placeholder="https://drive.google.com/..."
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Descripción
                          </label>
                          <textarea
                            rows={2}
                            value={editingDrive.description || ''}
                            onChange={(e) =>
                              setEditingDrive({
                                ...editingDrive,
                                description: e.target.value,
                              })
                            }
                            placeholder="Descripción de los recursos..."
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-black/80">
                            <input
                              type="checkbox"
                              checked={editingDrive.isActive ?? true}
                              onChange={(e) =>
                                setEditingDrive({
                                  ...editingDrive,
                                  isActive: e.target.checked,
                                })
                              }
                              className="w-4 h-4 rounded text-[#4E689B] focus:ring-[#4E689B]"
                            />
                            <span>Visible públicamente</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingDrive(null)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-black/70 hover:bg-slate-100"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-1.5 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#4E689B]/90 transition-colors shadow-xs"
                        >
                          {loading ? 'Guardando...' : 'Guardar comité'}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {drives
                      .sort((a, b) => a.order - b.order)
                      .map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#90AED1]/20 hover:border-[#4E689B]/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#4E689B]/10 text-[#4E689B] flex items-center justify-center">
                              {renderIcon(d.icon, 'w-4 h-4')}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-black block">
                                {d.name}
                              </span>
                              <span className="text-[11px] text-black/60 line-clamp-1">
                                {d.url}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingDrive(d)}
                              className="p-1.5 rounded-lg text-black/60 hover:text-[#4E689B] hover:bg-slate-100 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'drive',
                                  id: d.id,
                                  name: d.name,
                                })
                              }
                              className="p-1.5 rounded-lg text-black/60 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 5: ARCHIVO HISTORICO */}
              {activeTab === 'archives' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-black">
                        Archivo Histórico
                      </h3>
                      <p className="text-xs text-black/60">
                        Administra las carpetas de generaciones anteriores y actualiza enlaces (incluyendo MERC 2023).
                      </p>
                    </div>

                    {!editingArchive && (
                      <button
                        onClick={() =>
                          setEditingArchive({
                            year: 2027,
                            title: 'MERC 2027',
                            url: '',
                            isPending: true,
                            order: archives.length + 1,
                            isActive: true,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#4E689B]/90 transition-colors shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Añadir año histórico</span>
                      </button>
                    )}
                  </div>

                  {editingArchive && (
                    <form
                      onSubmit={handleSaveArchive}
                      className="p-5 rounded-2xl border border-[#4E689B]/30 bg-slate-50 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="text-sm font-bold text-[#4E689B]">
                          {editingArchive.id ? 'Editar Archivo Histórico' : 'Nueva Generación'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingArchive(null)}
                          className="text-xs text-black/50 hover:text-black font-semibold"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Año *
                          </label>
                          <input
                            type="number"
                            required
                            value={editingArchive.year || ''}
                            onChange={(e) =>
                              setEditingArchive({
                                ...editingArchive,
                                year: Number(e.target.value),
                                title: `MERC ${e.target.value}`,
                              })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Título
                          </label>
                          <input
                            type="text"
                            value={editingArchive.title || ''}
                            onChange={(e) =>
                              setEditingArchive({
                                ...editingArchive,
                                title: e.target.value,
                              })
                            }
                            placeholder="Ej: MERC 2023"
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Enlace de Google Drive (dejar vacío si está pendiente)
                          </label>
                          <input
                            type="url"
                            value={editingArchive.url || ''}
                            onChange={(e) =>
                              setEditingArchive({
                                ...editingArchive,
                                url: e.target.value,
                              })
                            }
                            placeholder="https://drive.google.com/..."
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-black/80">
                            <input
                              type="checkbox"
                              checked={editingArchive.isActive ?? true}
                              onChange={(e) =>
                                setEditingArchive({
                                  ...editingArchive,
                                  isActive: e.target.checked,
                                })
                              }
                              className="w-4 h-4 rounded text-[#4E689B] focus:ring-[#4E689B]"
                            />
                            <span>Visible públicamente</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingArchive(null)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-black/70 hover:bg-slate-100"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-1.5 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#4E689B]/90 transition-colors shadow-xs"
                        >
                          {loading ? 'Guardando...' : 'Guardar año'}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {archives
                      .sort((a, b) => b.year - a.year)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#90AED1]/20 hover:border-[#4E689B]/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base font-extrabold text-[#4E689B] w-12">
                              {item.year}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-black">
                                  {item.title}
                                </span>
                                {item.isPending || !item.url ? (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-black/60">
                                    Enlace pendiente
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    Enlace activo
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-black/60 line-clamp-1">
                                {item.url || 'Sin URL asignada'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingArchive(item)}
                              className="p-1.5 rounded-lg text-black/60 hover:text-[#4E689B] hover:bg-slate-100 transition-colors"
                              title="Editar enlace"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'archive',
                                  id: item.id,
                                  name: item.title,
                                })
                              }
                              className="p-1.5 rounded-lg text-black/60 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB: MIEMBROS DESTACADOS DEL MES */}
              {activeTab === 'featured' && (
                <AdminFeaturedMembersTab
                  featuredMembers={featuredMembers}
                  onDataChanged={() => {
                    loadAllAdminData();
                    onDataChanged();
                  }}
                  showNotification={showNotification}
                  onRequestDelete={(member) =>
                    setDeleteConfirm({
                      type: 'member',
                      id: member.id,
                      name: `${member.name} (${MONTH_NAMES[member.month - 1]} ${member.year})`,
                    })
                  }
                />
              )}

              {/* TAB: MI PERFIL */}
              {activeTab === 'profile' && (
                <AdminProfileTab
                  adminProfile={adminProfile}
                  onProfileUpdated={(updated) => {
                    setAdminProfile(updated);
                    if (siteConfig) {
                      setSiteConfig({ ...siteConfig, adminProfile: updated });
                    }
                    onDataChanged();
                  }}
                  showNotification={showNotification}
                />
              )}

              {/* TAB 6: CONFIGURACION GENERAL */}
              {activeTab === 'config' && (
                <div className="space-y-8 max-w-3xl">
                  {/* Hero Content Config */}
                  <div className="p-6 bg-white rounded-2xl border border-[#90AED1]/30 shadow-2xs">
                    <h3 className="text-base font-bold text-black mb-1 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[#4E689B]" />
                      Textos del Hero Principal
                    </h3>
                    <p className="text-xs text-black/60 mb-4">
                      Personaliza el título, subtítulo y la descripción visible al entrar a la plataforma.
                    </p>

                    {siteConfig && (
                      <form onSubmit={handleSaveConfig} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Título Principal
                          </label>
                          <input
                            type="text"
                            value={siteConfig.heroTitle}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                heroTitle: e.target.value,
                              })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Subtítulo
                          </label>
                          <input
                            type="text"
                            value={siteConfig.heroSubtitle}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                heroSubtitle: e.target.value,
                              })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Descripción
                          </label>
                          <textarea
                            rows={3}
                            value={siteConfig.heroDescription}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                heroDescription: e.target.value,
                              })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#4E689B]/90 transition-colors shadow-xs"
                          >
                            {loading ? 'Guardando...' : 'Guardar textos del sitio'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Change Admin Password Card */}
                  <div className="p-6 bg-white rounded-2xl border border-[#90AED1]/30 shadow-2xs">
                    <h3 className="text-base font-bold text-black mb-1 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#FD7C5E]" />
                      Cambiar Contraseña de Administrador
                    </h3>
                    <p className="text-xs text-black/60 mb-4">
                      Actualiza la contraseña temporal inicial por una credencial privada para tu gestión.
                    </p>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-black/80 mb-1">
                          Contraseña actual
                        </label>
                        <input
                          type="password"
                          required
                          value={currentPw}
                          onChange={(e) => setCurrentPw(e.target.value)}
                          placeholder="Ingresa la contraseña actual..."
                          className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Nueva contraseña (mínimo 6 caracteres)
                          </label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                            placeholder="Nueva contraseña..."
                            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Confirmar nueva contraseña
                          </label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPw}
                            onChange={(e) => setConfirmPw(e.target.value)}
                            placeholder="Repite la nueva contraseña..."
                            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 rounded-xl bg-[#FD7C5E] text-white text-xs font-semibold hover:bg-[#FD7C5E]/90 transition-colors shadow-xs"
                        >
                          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Chatbot & n8n Assistant Configuration Card */}
                  <div className="p-6 bg-white rounded-2xl border border-[#90AED1]/30 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-black flex items-center gap-2">
                        <Bot className="w-4 h-4 text-[#4E689B]" />
                        Asistente Virtual de Inteligencia Artificial (n8n)
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {chatbotForm.enabled ? 'Activo en web' : 'Desactivado'}
                      </span>
                    </div>
                    <p className="text-xs text-black/60 mb-4">
                      Gestiona la conexión del chatbot flotante con el webhook oficial de n8n para soporte del equipo en copies, ideas y diseño.
                    </p>

                    <form onSubmit={handleSaveChatbot} className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <input
                          id="chatbot-enabled-toggle"
                          type="checkbox"
                          checked={chatbotForm.enabled}
                          onChange={(e) =>
                            setChatbotForm({
                              ...chatbotForm,
                              enabled: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-[#4E689B] focus:ring-[#4E689B]"
                        />
                        <label
                          htmlFor="chatbot-enabled-toggle"
                          className="text-xs font-semibold text-black/80 cursor-pointer"
                        >
                          Mostrar el asistente virtual flotante en la página web pública
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-black/80 mb-1">
                          URL del Webhook de n8n
                        </label>
                        <input
                          type="url"
                          required
                          value={chatbotForm.webhookUrl}
                          onChange={(e) =>
                            setChatbotForm({
                              ...chatbotForm,
                              webhookUrl: e.target.value,
                            })
                          }
                          placeholder="https://.../webhook/.../chat"
                          className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                        />
                        <p className="text-[11px] text-black/50 mt-1">
                          Conectado directamente a tu endpoint de n8n Cloud.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Título del Asistente
                          </label>
                          <input
                            type="text"
                            required
                            value={chatbotForm.title}
                            onChange={(e) =>
                              setChatbotForm({
                                ...chatbotForm,
                                title: e.target.value,
                              })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black/80 mb-1">
                            Subtítulo
                          </label>
                          <input
                            type="text"
                            value={chatbotForm.subtitle}
                            onChange={(e) =>
                              setChatbotForm({
                                ...chatbotForm,
                                subtitle: e.target.value,
                              })
                            }
                            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-black/80 mb-1">
                          Mensaje de Bienvenida Inicial
                        </label>
                        <textarea
                          rows={2}
                          value={chatbotForm.welcomeMessage}
                          onChange={(e) =>
                            setChatbotForm({
                              ...chatbotForm,
                              welcomeMessage: e.target.value,
                            })
                          }
                          className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 rounded-xl bg-[#4E689B] text-white text-xs font-semibold hover:bg-[#30456B] transition-colors shadow-xs"
                        >
                          {loading ? 'Guardando...' : 'Guardar configuración del asistente'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Database Export & Backup */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-black flex items-center gap-2">
                        <Download className="w-4 h-4 text-[#4E689B]" />
                        Copia de seguridad de datos
                      </h4>
                      <p className="text-xs text-black/60 mt-0.5">
                        Descarga un archivo JSON completo con la información de eventos, herramientas, reuniones y enlaces.
                      </p>
                    </div>

                    <button
                      onClick={handleExportBackup}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-black/80 hover:bg-slate-100 transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar JSON</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 7: REGISTRO DE CAMBIOS (AUDIT LOGS) */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-black">
                      Registro de Cambios y Auditoría
                    </h3>
                    <p className="text-xs text-black/60">
                      Historial cronológico de modificaciones guardadas en la base de datos persistente.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#90AED1]/20 divide-y divide-slate-100 overflow-hidden">
                    {auditLogs.length === 0 ? (
                      <div className="p-8 text-center text-xs text-black/50">
                        No hay registros disponibles.
                      </div>
                    ) : (
                      auditLogs.map((log) => (
                        <div key={log.id} className="p-3.5 flex items-start justify-between gap-4 text-xs">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-[#4E689B]">
                                {log.action}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-black/60">
                                {log.user}
                              </span>
                            </div>
                            <p className="text-black/80">{log.details}</p>
                          </div>
                          <span className="text-[11px] text-black/40 font-mono shrink-0">
                            {new Date(log.timestamp).toLocaleString('es-CO')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
              <h4 className="text-base font-bold text-black mb-2">
                ¿Confirmar eliminación?
              </h4>
              <p className="text-xs text-black/70 mb-6">
                Estás a punto de eliminar permanentemente: <strong className="text-black">{deleteConfirm.name}</strong>. Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-black/70 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shadow-xs"
                >
                  Confirmar y Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
