export type EventCategory =
  | 'Publicaciones'
  | 'Reuniones'
  | 'Eventos'
  | 'Entregas'
  | 'Activaciones'
  | 'Fechas importantes'
  | 'Otros';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  description: string;
  category: EventCategory;
  color: string; // #4E689B, #90AED1, #FD7C5E, #000000
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  url: string;
  buttonText: string;
  icon: string;
  order: number;
  isActive: boolean;
  isHighlighted?: boolean;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  description: string;
  assignee?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface NextMeetingConfig {
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 a. m."
  location: string; // e.g. "Aula 38-101"
  additionalNotes?: string;
  isDefined: boolean;
}

export interface MeetingRecord {
  id: string;
  date: string;
  title: string;
  summary: string;
  topics: string[];
  decisions: string[];
  notes: string;
  nextMeetingDate?: string;
  tasks?: TaskItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CommitteeDrive {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  order: number;
  isActive: boolean;
  updatedAt: string;
}

export interface HistoryArchive {
  id: string;
  year: number;
  title: string;
  url: string;
  isPending: boolean;
  order: number;
  isActive: boolean;
  updatedAt: string;
}

export interface AdminProfile {
  name: string;
  role: string;
  avatarUrl?: string; // base64 data URL or external URL
  updatedAt: string;
}

export interface FeaturedMember {
  id: string;
  name: string;
  role?: string;
  month: number; // 1 = Enero, 12 = Diciembre
  year: number; // e.g. 2026, 2027, 2028
  photoUrl: string; // base64 or URL
  quote?: string; // optional recognition message
  badge?: string; // e.g. "Creatividad", "Liderazgo", "Compromiso", "Excelencia"
  badgeColor?: string; // e.g. #FD7C5E, #4E689B, #90AED1
  status: 'draft' | 'published';
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  welcomeMessage: string;
  webhookUrl: string;
}

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  featuredMonth: number; // 0 to 11 for backward compatibility
  calendarInitialMonthMode?: 'auto' | string; // 'auto' or '0'..'11'
  nextMeeting?: NextMeetingConfig;
  adminProfile?: AdminProfile;
  chatbot?: ChatbotConfig;
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

