import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  SiteConfig,
  CalendarEvent,
  ToolItem,
  MeetingRecord,
  CommitteeDrive,
  HistoryArchive,
  AuditLog,
  FeaturedMember,
  AdminProfile,
} from '../src/types';

interface DatabaseSchema {
  siteConfig: SiteConfig;
  events: CalendarEvent[];
  tools: ToolItem[];
  meetings: MeetingRecord[];
  committeeDrives: CommitteeDrive[];
  historyArchives: HistoryArchive[];
  featuredMembers: FeaturedMember[];
  auditLogs: AuditLog[];
  auth: {
    salt: string;
    hash: string;
    sessions: Record<string, { createdAt: string; expiresAt: string }>;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

const INITIAL_SALT = crypto.randomBytes(16).toString('hex');
// Initial password required: 1034990304
const INITIAL_HASH = hashPassword('1034990304', INITIAL_SALT);

const DEFAULT_DATA: DatabaseSchema = {
  siteConfig: {
    heroTitle: 'Merc a la Mano 2027',
    heroSubtitle: 'Todo lo que necesita Mercadeo, en dos clics.',
    heroDescription:
      'El centro de herramientas, recursos y organización del comité de Mercadeo de Partners Campus EAFIT.',
    featuredMonth: 0, // 0 = Enero 2027
    calendarInitialMonthMode: 'auto', // 'auto' (real-time Bogota) or '0'..'11'
    nextMeeting: {
      date: '',
      time: '',
      location: '',
      additionalNotes: '',
      isDefined: false,
    },
    adminProfile: {
      name: 'Administrador de Mercadeo',
      role: 'Comité de Mercadeo Partners Campus',
      avatarUrl: '',
      updatedAt: new Date().toISOString(),
    },
    chatbot: {
      enabled: true,
      title: 'Asistente de Mercadeo',
      subtitle: 'Partners Campus EAFIT • n8n AI',
      welcomeMessage:
        '¡Hola! Soy el asistente virtual de Mercadeo de Partners Campus. ¿En qué te puedo ayudar hoy con copies, ideas de diseño, contenido para redes o campañas?',
      webhookUrl:
        'https://porza.app.n8n.cloud/webhook/35e78195-181d-434a-94e4-ae1e2c1d9b6f/chat',
    },
    lastUpdated: new Date().toISOString(),
  },
  events: [],
  tools: [
    {
      id: 'tool-manual-marca',
      name: 'Manual de marca',
      description:
        'Consulta los lineamientos visuales, colores, tipografías y usos de la identidad de Partners Campus.',
      url: 'https://canva.link/rwsylkjvse96vgm',
      buttonText: 'Abrir manual',
      icon: 'BookOpen',
      order: 1,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tool-planner-contenido',
      name: 'Planner de contenido',
      description:
        'Organiza las publicaciones, actividades, responsables y tareas del comité.',
      url: 'https://planner.cloud.microsoft/ui/web/v1/plan/OxLBKQgTskOkXtVeHRWoa2QAGa_u?tid=99f7b55e-9cbe-467b-8143-919782918afb',
      buttonText: 'Abrir planner',
      icon: 'CalendarCheck',
      order: 2,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tool-ideacion',
      name: 'Ideación',
      description:
        'Comparte ideas, propuestas creativas y oportunidades de contenido para revisarlas en las reuniones del comité.',
      url: 'https://forms.gle/o2QYntmQdVwZcP4g8',
      buttonText: 'Compartir una idea',
      icon: 'Lightbulb',
      order: 3,
      isActive: true,
      isHighlighted: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tool-portadas-reels',
      name: 'Portadas de reels',
      description:
        'Encuentra las plantillas, dimensiones y márgenes necesarios para mantener una identidad visual consistente.',
      url: 'https://canva.link/ye13wr1sg5lf7ft',
      buttonText: 'Crear portada',
      icon: 'Video',
      order: 4,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tool-historias',
      name: 'Historias',
      description:
        'Consulta las plantillas de historias, sus dimensiones y las zonas seguras que debemos respetar.',
      url: 'https://canva.link/fueiu7y4nwv4t8y',
      buttonText: 'Crear historia',
      icon: 'Smartphone',
      order: 5,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tool-parrilla-visual',
      name: 'Parrilla visual',
      description:
        'Consulta la organización visual del feed, las portadas, los colores y la coherencia de nuestras publicaciones.',
      url: 'https://canva.link/7ejetr8jvp9qtur',
      buttonText: 'Consultar parrilla',
      icon: 'LayoutGrid',
      order: 6,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tool-drive-mercadeo-2027',
      name: 'Drive de Mercadeo 2027',
      description:
        'Encuentra los documentos, archivos, piezas y recursos de trabajo del comité durante 2027.',
      url: 'https://drive.google.com/drive/folders/1C5DZtdpzZYgCZqLVq0DL58RWoA0nwXsz?usp=sharing',
      buttonText: 'Abrir Drive',
      icon: 'Folder',
      order: 7,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
  ],
  meetings: [
    {
      id: 'meeting-provisional-initial',
      date: '2027-01-15',
      title: 'Espacio de seguimiento del comité (Pendiente de actualización)',
      summary:
        'Espacio destinado a registrar los principales temas tratados, avances y decisiones de la reunión más reciente.',
      topics: [
        'Planificación de objetivos de comunicación 2027',
        'Coordinación de cronograma de publicaciones y parrilla',
        'Distribución de responsabilidades del comité',
      ],
      decisions: [
        'Utilizar Merc a la Mano como punto centralizado de acceso a recursos',
        'Revisión periódica de tareas y entregas en las sesiones quincenales',
      ],
      notes:
        'Registra aquí las recomendaciones y recordatorios importantes para el comité.',
      nextMeetingDate: '',
      tasks: [
        {
          id: 'task-1',
          description:
            'Añadir las tareas acordadas, responsables y fechas de seguimiento',
          assignee: 'Comité de Mercadeo',
          dueDate: '2027-01-30',
          status: 'pending',
        },
        {
          id: 'task-2',
          description:
            'Revisar accesos de Drive institucional y herramientas de Canva',
          assignee: 'Líder de Mercadeo',
          dueDate: '2027-01-22',
          status: 'in_progress',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  committeeDrives: [
    {
      id: 'drive-gh',
      name: 'Gestión Humana',
      description: 'Documentos y materiales del comité de Gestión Humana.',
      url: 'https://drive.google.com/drive/folders/10KlRK7_yGZnAcy5Vemluehlnzg9h4_X_?usp=sharing',
      icon: 'Users',
      order: 1,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'drive-internacional',
      name: 'Internacional',
      description: 'Recursos y materiales del comité Internacional.',
      url: 'https://drive.google.com/drive/folders/1xPL_EiF5e3kDfVJLedsNWAzGPxKlQgHU?usp=sharing',
      icon: 'Globe',
      order: 2,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'drive-mercadeo',
      name: 'Mercadeo',
      description:
        'Archivos de trabajo, piezas y documentos del comité de Mercadeo.',
      url: 'https://drive.google.com/drive/folders/1WjFDZNlXd5gJZc8JSiGLZge9p1_bbsFv?usp=sharing',
      icon: 'Megaphone',
      order: 3,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'drive-rrpp',
      name: 'Relaciones Públicas',
      description:
        'Documentos, recursos y materiales del comité de Relaciones Públicas.',
      url: 'https://drive.google.com/drive/folders/1Wf_XzZcGwggAg5KKFQ5GOiNDtqksL4Hp?usp=sharing',
      icon: 'Share2',
      order: 4,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'drive-social',
      name: 'Social',
      description: 'Recursos y documentos del comité Social.',
      url: 'https://drive.google.com/drive/folders/1N6J25W_j6rQ8izbNUrLHE6UAyq9-0nkH?usp=sharing',
      icon: 'HeartHandshake',
      order: 5,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'drive-fotos',
      name: 'Fotos de miembros',
      description:
        'Carpeta de fotografías de los integrantes de Partners Campus.',
      url: 'https://drive.google.com/drive/folders/17jbi9o7KahNyaSDbeRq59xFmYW3pkpwz?usp=sharing',
      icon: 'Camera',
      order: 6,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
  ],
  historyArchives: [
    {
      id: 'archive-2026',
      year: 2026,
      title: 'MERC 2026',
      url: 'https://drive.google.com/drive/folders/13YYZI1stHs2yfshFd9J07bxc0X4oI_00',
      isPending: false,
      order: 1,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'archive-2025',
      year: 2025,
      title: 'MERC 2025',
      url: 'https://drive.google.com/drive/folders/1VndCdTqkxHUYk2HAZpjpdRwFaLGLSO7p?usp=sharing',
      isPending: false,
      order: 2,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'archive-2024',
      year: 2024,
      title: 'MERC 2024',
      url: 'https://drive.google.com/drive/folders/1fTwZ3mR6gKL7a547l9iARvBOzy33yj_D',
      isPending: false,
      order: 3,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'archive-2023',
      year: 2023,
      title: 'MERC 2023',
      url: '',
      isPending: true,
      order: 4,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'archive-2022',
      year: 2022,
      title: 'MERC 2022',
      url: 'https://drive.google.com/drive/folders/1h_90mNN-1z4YU2l9bPZ6_Szk40NiWyyx',
      isPending: false,
      order: 5,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'archive-2021',
      year: 2021,
      title: 'MERC 2021',
      url: 'https://drive.google.com/drive/folders/12WyGxhrtR2K_VTnkFPM6y3Ptj_5F3BTs',
      isPending: false,
      order: 6,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
  ],
  featuredMembers: [],
  auditLogs: [
    {
      id: 'log-init',
      timestamp: new Date().toISOString(),
      user: 'Sistema',
      action: 'Inicialización',
      details: 'Plataforma Merc a la Mano 2027 inicializada con datos oficiales',
    },
  ],
  auth: {
    salt: INITIAL_SALT,
    hash: INITIAL_HASH,
    sessions: {},
  },
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_DATA,
          ...parsed,
          siteConfig: {
            ...DEFAULT_DATA.siteConfig,
            ...(parsed.siteConfig || {}),
            adminProfile:
              parsed.siteConfig?.adminProfile || DEFAULT_DATA.siteConfig.adminProfile,
            chatbot: {
              ...DEFAULT_DATA.siteConfig.chatbot,
              ...(parsed.siteConfig?.chatbot || {}),
            },
          },
          featuredMembers: parsed.featuredMembers || [],
        };
      }
    } catch (err) {
      console.error('Error reading db.json, using defaults:', err);
    }
    this.saveData(DEFAULT_DATA);
    return DEFAULT_DATA;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmp = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmp, DB_FILE);
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public commit(user = 'Admin', action = 'Modificación', details = ''): void {
    this.data.siteConfig.lastUpdated = new Date().toISOString();
    this.data.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      user,
      action,
      details,
    });
    // Keep only last 100 audit logs
    if (this.data.auditLogs.length > 100) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 100);
    }
    this.saveData(this.data);
  }

  // Auth methods
  public verifyPassword(password: string): boolean {
    const calculated = hashPassword(password, this.data.auth.salt);
    return calculated === this.data.auth.hash;
  }

  public createSession(): string {
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    this.data.auth.sessions[token] = {
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    this.saveData(this.data);
    return token;
  }

  public isValidSession(token: string): boolean {
    if (!token) return false;
    const session = this.data.auth.sessions[token];
    if (!session) return false;
    if (new Date(session.expiresAt) < new Date()) {
      delete this.data.auth.sessions[token];
      this.saveData(this.data);
      return false;
    }
    return true;
  }

  public invalidateSession(token: string): void {
    if (this.data.auth.sessions[token]) {
      delete this.data.auth.sessions[token];
      this.saveData(this.data);
    }
  }

  public updatePassword(newPassword: string): void {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(newPassword, salt);
    this.data.auth.salt = salt;
    this.data.auth.hash = hash;
    this.data.auth.sessions = {}; // Invalidate old sessions
    this.commit('Admin', 'Seguridad', 'Contraseña administrativa actualizada');
  }
}

export const db = new Database();
