import type {
  CalendarEvent,
  ToolItem,
  MeetingRecord,
  CommitteeDrive,
  HistoryArchive,
  SiteConfig,
  AuditLog,
  FeaturedMember,
  AdminProfile,
  ChatbotConfig,
} from '../types';

const TOKEN_KEY = 'mercam_admin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface PublicDataPayload {
  siteConfig: SiteConfig;
  events: CalendarEvent[];
  tools: ToolItem[];
  committeeDrives: CommitteeDrive[];
  historyArchives: HistoryArchive[];
  meetings: MeetingRecord[];
  latestMeeting: MeetingRecord | null;
  featuredMembers: FeaturedMember[];
}

export interface AdminAllPayload {
  siteConfig: SiteConfig;
  events: CalendarEvent[];
  tools: ToolItem[];
  meetings: MeetingRecord[];
  committeeDrives: CommitteeDrive[];
  historyArchives: HistoryArchive[];
  featuredMembers: FeaturedMember[];
  auditLogs: AuditLog[];
}

export class AuthExpiredError extends Error {
  constructor() {
    super('La sesión expiró');
    this.name = 'AuthExpiredError';
  }
}

export async function fetchPublicData(): Promise<PublicDataPayload> {
  const res = await fetch('/api/public-data');
  if (!res.ok) {
    throw new Error(`Error al cargar datos públicos (HTTP ${res.status})`);
  }
  const json = await res.json();
  return json.data;
}

export async function loginAdmin(
  password: string
): Promise<{ token: string; data: AdminAllPayload }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Contraseña incorrecta');
  }
  setStoredToken(data.token);
  return { token: data.token, data: data.data };
}

export async function verifyAuth(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  try {
    const res = await fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return Boolean(data.authenticated);
  } catch {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignore
    }
  }
  removeStoredToken();
}

export async function fetchAdminAll(): Promise<AdminAllPayload> {
  const res = await fetch('/api/admin/all', {
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    throw new AuthExpiredError();
  }
  if (!res.ok) {
    throw new Error(`Error al cargar el panel (HTTP ${res.status})`);
  }
  const json = await res.json();
  return json.data;
}

export async function updateSiteConfig(config: Partial<SiteConfig>): Promise<SiteConfig> {
  const res = await fetch('/api/admin/site-config', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(config),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al actualizar configuración');
  return data.data;
}

export async function updateNextMeeting(nextMeeting: Partial<import('../types').NextMeetingConfig>): Promise<import('../types').NextMeetingConfig> {
  const res = await fetch('/api/admin/next-meeting', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(nextMeeting),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al actualizar próxima reunión');
  return data.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch('/api/admin/change-password', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al cambiar contraseña');
  if (data.token) {
    setStoredToken(data.token);
  }
}

// Events
export async function createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
  const res = await fetch('/api/admin/events', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(event),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al crear evento');
  return data.data;
}

export async function updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
  const res = await fetch(`/api/admin/events/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(event),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al actualizar evento');
  return data.data;
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(`/api/admin/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al eliminar evento');
}

// Tools
export async function createTool(tool: Partial<ToolItem>): Promise<ToolItem> {
  const res = await fetch('/api/admin/tools', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(tool),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al crear herramienta');
  return data.data;
}

export async function updateTool(id: string, tool: Partial<ToolItem>): Promise<ToolItem> {
  const res = await fetch(`/api/admin/tools/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(tool),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al actualizar herramienta');
  return data.data;
}

export async function deleteTool(id: string): Promise<void> {
  const res = await fetch(`/api/admin/tools/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al eliminar herramienta');
}

// Meetings
export async function createMeeting(meeting: Partial<MeetingRecord>): Promise<MeetingRecord> {
  const res = await fetch('/api/admin/meetings', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(meeting),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al crear reunión');
  return data.data;
}

export async function updateMeeting(id: string, meeting: Partial<MeetingRecord>): Promise<MeetingRecord> {
  const res = await fetch(`/api/admin/meetings/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(meeting),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al actualizar reunión');
  return data.data;
}

export async function deleteMeeting(id: string): Promise<void> {
  const res = await fetch(`/api/admin/meetings/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al eliminar reunión');
}

// Committee Drives
export async function createCommitteeDrive(drive: Partial<CommitteeDrive>): Promise<CommitteeDrive> {
  const res = await fetch('/api/admin/committee-drives', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(drive),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al crear drive');
  return data.data;
}

export async function updateCommitteeDrive(id: string, drive: Partial<CommitteeDrive>): Promise<CommitteeDrive> {
  const res = await fetch(`/api/admin/committee-drives/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(drive),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al actualizar drive');
  return data.data;
}

export async function deleteCommitteeDrive(id: string): Promise<void> {
  const res = await fetch(`/api/admin/committee-drives/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al eliminar drive');
}

// History Archives
export async function createHistoryArchive(archive: Partial<HistoryArchive>): Promise<HistoryArchive> {
  const res = await fetch('/api/admin/history-archives', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(archive),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al crear archivo histórico');
  return data.data;
}

export async function updateHistoryArchive(id: string, archive: Partial<HistoryArchive>): Promise<HistoryArchive> {
  const res = await fetch(`/api/admin/history-archives/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(archive),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al actualizar archivo');
  return data.data;
}

export async function deleteHistoryArchive(id: string): Promise<void> {
  const res = await fetch(`/api/admin/history-archives/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Error al eliminar archivo');
}

export async function exportBackup(): Promise<unknown> {
  const res = await fetch('/api/admin/export', {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return data.backup;
}

// ---------------- ADMIN PROFILE CLIENT API ----------------

export async function updateAdminProfile(
  profile: Partial<AdminProfile>
): Promise<AdminProfile> {
  const res = await fetch('/api/admin/profile', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profile),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al actualizar perfil de administrador');
  }
  return data.data;
}

export async function resetAdminAvatar(): Promise<AdminProfile> {
  const res = await fetch('/api/admin/profile/reset-avatar', {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al restablecer foto de perfil');
  }
  return data.data;
}

// ---------------- FEATURED MEMBERS CLIENT API ----------------

export async function createFeaturedMember(
  member: Partial<FeaturedMember>
): Promise<FeaturedMember> {
  const res = await fetch('/api/admin/featured-members', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(member),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al registrar miembro destacado');
  }
  return data.data;
}

export async function updateFeaturedMember(
  id: string,
  member: Partial<FeaturedMember>
): Promise<FeaturedMember> {
  const res = await fetch(`/api/admin/featured-members/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(member),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al actualizar miembro destacado');
  }
  return data.data;
}

export async function deleteFeaturedMember(id: string): Promise<void> {
  const res = await fetch(`/api/admin/featured-members/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al eliminar miembro destacado');
  }
}

// ---------------- CHATBOT CLIENT API ----------------

export async function sendChatMessage(
  message: string,
  sessionId?: string
): Promise<{ reply: string; sessionId: string }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, sessionId }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al comunicarse con el asistente virtual');
  }
  return {
    reply: data.reply,
    sessionId: data.sessionId,
  };
}

export async function updateChatbotConfig(
  config: Partial<ChatbotConfig>
): Promise<ChatbotConfig> {
  const res = await fetch('/api/admin/chatbot', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(config),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al actualizar configuración del chatbot');
  }
  return data.data;
}

