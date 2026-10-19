import express, { Request, Response, NextFunction } from 'express';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';
import type { FeaturedMember } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Auth middleware for administrative write operations
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Acceso no autorizado' });
  }
  const token = authHeader.split(' ')[1];
  if (!db.isValidSession(token)) {
    return res.status(401).json({ success: false, error: 'Sesión expirada o inválida' });
  }
  next();
}

// ---------------- PUBLIC API ROUTES ----------------

app.get('/api/public-data', (req: Request, res: Response) => {
  const data = db.getData();
  const sortedTools = [...data.tools]
    .filter((t) => t.isActive)
    .sort((a, b) => a.order - b.order);

  const sortedDrives = [...data.committeeDrives]
    .filter((d) => d.isActive)
    .sort((a, b) => a.order - b.order);

  const sortedArchives = [...data.historyArchives]
    .filter((h) => h.isActive)
    .sort((a, b) => b.year - a.year);

  const sortedMeetings = [...data.meetings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const publishedMembers = [...(data.featuredMembers || [])]
    .filter((m) => m.status === 'published')
    .sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });

  return res.json({
    success: true,
    data: {
      siteConfig: data.siteConfig,
      events: data.events,
      tools: sortedTools,
      committeeDrives: sortedDrives,
      historyArchives: sortedArchives,
      meetings: sortedMeetings,
      latestMeeting: sortedMeetings[0] || null,
      featuredMembers: publishedMembers,
    },
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, error: 'Se requiere contraseña' });
  }

  const isValid = db.verifyPassword(password.trim());
  if (!isValid) {
    return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
  }

  const token = db.createSession();
  db.commit('Admin', 'Autenticación', 'Inicio de sesión exitoso');
  return res.json({ success: true, token, message: 'Autenticado correctamente' });
});

app.get('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ success: false, authenticated: false });
  }
  const token = authHeader.split(' ')[1];
  const valid = db.isValidSession(token);
  return res.json({ success: true, authenticated: valid });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.invalidateSession(token);
  }
  return res.json({ success: true, message: 'Sesión cerrada' });
});

// ---------------- PROTECTED ADMIN ROUTES ----------------

app.get('/api/admin/all', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  return res.json({
    success: true,
    data: {
      siteConfig: data.siteConfig,
      events: data.events,
      tools: data.tools,
      meetings: data.meetings,
      committeeDrives: data.committeeDrives,
      historyArchives: data.historyArchives,
      featuredMembers: data.featuredMembers || [],
      auditLogs: data.auditLogs,
    },
  });
});

// Update Site Config
app.put('/api/admin/site-config', requireAuth, (req: Request, res: Response) => {
  const { heroTitle, heroSubtitle, heroDescription, featuredMonth, calendarInitialMonthMode, nextMeeting } = req.body;
  const data = db.getData();

  if (heroTitle !== undefined) data.siteConfig.heroTitle = heroTitle;
  if (heroSubtitle !== undefined) data.siteConfig.heroSubtitle = heroSubtitle;
  if (heroDescription !== undefined) data.siteConfig.heroDescription = heroDescription;
  if (nextMeeting !== undefined) data.siteConfig.nextMeeting = nextMeeting;
  if (calendarInitialMonthMode !== undefined) {
    data.siteConfig.calendarInitialMonthMode = calendarInitialMonthMode;
    if (calendarInitialMonthMode !== 'auto') {
      data.siteConfig.featuredMonth = Number(calendarInitialMonthMode);
    }
  } else if (featuredMonth !== undefined) {
    const monthNum = Number(featuredMonth);
    if (monthNum >= 0 && monthNum <= 11) {
      data.siteConfig.featuredMonth = monthNum;
      data.siteConfig.calendarInitialMonthMode = String(monthNum);
    }
  }

  db.commit('Admin', 'Configuración General', 'Actualización de configuración del sitio y mes inicial');
  return res.json({ success: true, data: data.siteConfig });
});

// Update Next Meeting Configuration
app.put('/api/admin/next-meeting', requireAuth, (req: Request, res: Response) => {
  const { date, time, location, additionalNotes, isDefined } = req.body;
  const data = db.getData();

  const isConfigured = Boolean(
    isDefined !== undefined ? isDefined : (date && date.trim().length > 0)
  );

  data.siteConfig.nextMeeting = {
    date: date ? date.trim() : '',
    time: time ? time.trim() : '',
    location: location ? location.trim() : '',
    additionalNotes: additionalNotes ? additionalNotes.trim() : '',
    isDefined: isConfigured,
  };

  db.commit(
    'Admin',
    'Seguimiento MERC',
    `Próxima reunión actualizada: ${data.siteConfig.nextMeeting.date || 'Sin fecha'} - ${data.siteConfig.nextMeeting.location || 'Sin aula'}`
  );

  return res.json({ success: true, data: data.siteConfig.nextMeeting });
});

// Change Admin Password
app.post('/api/admin/change-password', requireAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
  }
  if (!db.verifyPassword(currentPassword)) {
    return res.status(400).json({ success: false, error: 'La contraseña actual no coincide' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  db.updatePassword(newPassword);
  // Create a new session for the current user
  const newToken = db.createSession();
  return res.json({ success: true, token: newToken, message: 'Contraseña actualizada con éxito' });
});

// ---------------- CALENDAR EVENTS CRUD ----------------

app.post('/api/admin/events', requireAuth, (req: Request, res: Response) => {
  const { title, date, time, description, category, color, link } = req.body;
  if (!title || !date || !category) {
    return res.status(400).json({ success: false, error: 'Título, fecha y categoría son obligatorios' });
  }

  const data = db.getData();
  const newEvent = {
    id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    date: date.trim(),
    time: time ? time.trim() : undefined,
    description: description ? description.trim() : '',
    category,
    color: color || '#4E689B',
    link: link ? link.trim() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.events.push(newEvent);
  db.commit('Admin', 'Crear Evento', `Evento creado: ${newEvent.title} (${newEvent.date})`);
  return res.json({ success: true, data: newEvent });
});

app.put('/api/admin/events/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, date, time, description, category, color, link } = req.body;
  const data = db.getData();
  const event = data.events.find((e) => e.id === id);

  if (!event) {
    return res.status(404).json({ success: false, error: 'Evento no encontrado' });
  }

  if (title !== undefined) event.title = title.trim();
  if (date !== undefined) event.date = date.trim();
  if (time !== undefined) event.time = time ? time.trim() : undefined;
  if (description !== undefined) event.description = description.trim();
  if (category !== undefined) event.category = category;
  if (color !== undefined) event.color = color;
  if (link !== undefined) event.link = link ? link.trim() : undefined;
  event.updatedAt = new Date().toISOString();

  db.commit('Admin', 'Editar Evento', `Evento modificado: ${event.title}`);
  return res.json({ success: true, data: event });
});

app.delete('/api/admin/events/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const index = data.events.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Evento no encontrado' });
  }

  const removed = data.events.splice(index, 1)[0];
  db.commit('Admin', 'Eliminar Evento', `Evento eliminado: ${removed.title}`);
  return res.json({ success: true, message: 'Evento eliminado con éxito' });
});

// ---------------- TOOLS CRUD ----------------

app.post('/api/admin/tools', requireAuth, (req: Request, res: Response) => {
  const { name, description, url, buttonText, icon, order, isActive, isHighlighted } = req.body;
  if (!name || !url) {
    return res.status(400).json({ success: false, error: 'Nombre y URL son obligatorios' });
  }

  const data = db.getData();
  const newTool = {
    id: `tool-${Date.now()}`,
    name: name.trim(),
    description: description ? description.trim() : '',
    url: url.trim(),
    buttonText: buttonText ? buttonText.trim() : 'Acceder',
    icon: icon || 'Folder',
    order: order !== undefined ? Number(order) : data.tools.length + 1,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    isHighlighted: Boolean(isHighlighted),
    updatedAt: new Date().toISOString(),
  };

  data.tools.push(newTool);
  db.commit('Admin', 'Crear Herramienta', `Herramienta creada: ${newTool.name}`);
  return res.json({ success: true, data: newTool });
});

app.put('/api/admin/tools/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, url, buttonText, icon, order, isActive, isHighlighted } = req.body;
  const data = db.getData();
  const tool = data.tools.find((t) => t.id === id);

  if (!tool) {
    return res.status(404).json({ success: false, error: 'Herramienta no encontrada' });
  }

  if (name !== undefined) tool.name = name.trim();
  if (description !== undefined) tool.description = description.trim();
  if (url !== undefined) tool.url = url.trim();
  if (buttonText !== undefined) tool.buttonText = buttonText.trim();
  if (icon !== undefined) tool.icon = icon;
  if (order !== undefined) tool.order = Number(order);
  if (isActive !== undefined) tool.isActive = Boolean(isActive);
  if (isHighlighted !== undefined) tool.isHighlighted = Boolean(isHighlighted);
  tool.updatedAt = new Date().toISOString();

  db.commit('Admin', 'Editar Herramienta', `Herramienta modificada: ${tool.name}`);
  return res.json({ success: true, data: tool });
});

app.delete('/api/admin/tools/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const index = data.tools.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Herramienta no encontrada' });
  }

  const removed = data.tools.splice(index, 1)[0];
  db.commit('Admin', 'Eliminar Herramienta', `Herramienta eliminada: ${removed.name}`);
  return res.json({ success: true, message: 'Herramienta eliminada con éxito' });
});

// ---------------- MEETINGS & TRACKING CRUD ----------------

app.post('/api/admin/meetings', requireAuth, (req: Request, res: Response) => {
  const { date, title, summary, topics, decisions, notes, nextMeetingDate, tasks } = req.body;
  if (!date || !title) {
    return res.status(400).json({ success: false, error: 'Fecha y título son obligatorios' });
  }

  const data = db.getData();
  const newMeeting = {
    id: `meeting-${Date.now()}`,
    date: date.trim(),
    title: title.trim(),
    summary: summary ? summary.trim() : '',
    topics: Array.isArray(topics) ? topics : [],
    decisions: Array.isArray(decisions) ? decisions : [],
    notes: notes ? notes.trim() : '',
    nextMeetingDate: nextMeetingDate ? nextMeetingDate.trim() : '',
    tasks: Array.isArray(tasks) ? tasks : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.meetings.unshift(newMeeting);
  db.commit('Admin', 'Crear Reunión', `Reunión registrada: ${newMeeting.title} (${newMeeting.date})`);
  return res.json({ success: true, data: newMeeting });
});

app.put('/api/admin/meetings/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, title, summary, topics, decisions, notes, nextMeetingDate, tasks } = req.body;
  const data = db.getData();
  const meeting = data.meetings.find((m) => m.id === id);

  if (!meeting) {
    return res.status(404).json({ success: false, error: 'Reunión no encontrada' });
  }

  if (date !== undefined) meeting.date = date.trim();
  if (title !== undefined) meeting.title = title.trim();
  if (summary !== undefined) meeting.summary = summary.trim();
  if (topics !== undefined && Array.isArray(topics)) meeting.topics = topics;
  if (decisions !== undefined && Array.isArray(decisions)) meeting.decisions = decisions;
  if (notes !== undefined) meeting.notes = notes.trim();
  if (nextMeetingDate !== undefined) meeting.nextMeetingDate = nextMeetingDate ? nextMeetingDate.trim() : '';
  if (tasks !== undefined && Array.isArray(tasks)) meeting.tasks = tasks;
  meeting.updatedAt = new Date().toISOString();

  db.commit('Admin', 'Editar Reunión', `Reunión modificada: ${meeting.title}`);
  return res.json({ success: true, data: meeting });
});

app.delete('/api/admin/meetings/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const index = data.meetings.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Reunión no encontrada' });
  }

  const removed = data.meetings.splice(index, 1)[0];
  db.commit('Admin', 'Eliminar Reunión', `Reunión eliminada: ${removed.title}`);
  return res.json({ success: true, message: 'Reunión eliminada con éxito' });
});

// ---------------- COMMITTEE DRIVES CRUD ----------------

app.post('/api/admin/committee-drives', requireAuth, (req: Request, res: Response) => {
  const { name, description, url, icon, order, isActive } = req.body;
  if (!name || !url) {
    return res.status(400).json({ success: false, error: 'Nombre y enlace son requeridos' });
  }

  const data = db.getData();
  const newDrive = {
    id: `drive-${Date.now()}`,
    name: name.trim(),
    description: description ? description.trim() : '',
    url: url.trim(),
    icon: icon || 'Folder',
    order: order !== undefined ? Number(order) : data.committeeDrives.length + 1,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    updatedAt: new Date().toISOString(),
  };

  data.committeeDrives.push(newDrive);
  db.commit('Admin', 'Crear Drive de Comité', `Comité añadido: ${newDrive.name}`);
  return res.json({ success: true, data: newDrive });
});

app.put('/api/admin/committee-drives/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, url, icon, order, isActive } = req.body;
  const data = db.getData();
  const drive = data.committeeDrives.find((d) => d.id === id);

  if (!drive) {
    return res.status(404).json({ success: false, error: 'Drive de comité no encontrado' });
  }

  if (name !== undefined) drive.name = name.trim();
  if (description !== undefined) drive.description = description.trim();
  if (url !== undefined) drive.url = url.trim();
  if (icon !== undefined) drive.icon = icon;
  if (order !== undefined) drive.order = Number(order);
  if (isActive !== undefined) drive.isActive = Boolean(isActive);
  drive.updatedAt = new Date().toISOString();

  db.commit('Admin', 'Editar Drive de Comité', `Comité modificado: ${drive.name}`);
  return res.json({ success: true, data: drive });
});

app.delete('/api/admin/committee-drives/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const index = data.committeeDrives.findIndex((d) => d.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Drive no encontrado' });
  }

  const removed = data.committeeDrives.splice(index, 1)[0];
  db.commit('Admin', 'Eliminar Drive de Comité', `Comité eliminado: ${removed.name}`);
  return res.json({ success: true, message: 'Drive de comité eliminado con éxito' });
});

// ---------------- HISTORY ARCHIVES CRUD ----------------

app.post('/api/admin/history-archives', requireAuth, (req: Request, res: Response) => {
  const { year, title, url, isPending, order, isActive } = req.body;
  if (!year) {
    return res.status(400).json({ success: false, error: 'Año es requerido' });
  }

  const data = db.getData();
  const yearNum = Number(year);
  const newArchive = {
    id: `archive-${yearNum}`,
    year: yearNum,
    title: title ? title.trim() : `MERC ${yearNum}`,
    url: url ? url.trim() : '',
    isPending: Boolean(isPending) || !url,
    order: order !== undefined ? Number(order) : data.historyArchives.length + 1,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    updatedAt: new Date().toISOString(),
  };

  data.historyArchives.push(newArchive);
  db.commit('Admin', 'Crear Archivo Histórico', `Generación añadida: ${newArchive.title}`);
  return res.json({ success: true, data: newArchive });
});

app.put('/api/admin/history-archives/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { year, title, url, isPending, order, isActive } = req.body;
  const data = db.getData();
  const archive = data.historyArchives.find((a) => a.id === id);

  if (!archive) {
    return res.status(404).json({ success: false, error: 'Archivo no encontrado' });
  }

  if (year !== undefined) archive.year = Number(year);
  if (title !== undefined) archive.title = title.trim();
  if (url !== undefined) {
    archive.url = url.trim();
    if (archive.url.length > 0) {
      archive.isPending = false;
    }
  }
  if (isPending !== undefined) archive.isPending = Boolean(isPending);
  if (order !== undefined) archive.order = Number(order);
  if (isActive !== undefined) archive.isActive = Boolean(isActive);
  archive.updatedAt = new Date().toISOString();

  db.commit('Admin', 'Editar Archivo Histórico', `Generación modificada: ${archive.title}`);
  return res.json({ success: true, data: archive });
});

app.delete('/api/admin/history-archives/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const index = data.historyArchives.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Archivo no encontrado' });
  }

  const removed = data.historyArchives.splice(index, 1)[0];
  db.commit('Admin', 'Eliminar Archivo Histórico', `Generación eliminada: ${removed.title}`);
  return res.json({ success: true, message: 'Archivo histórico eliminado con éxito' });
});

// Data export for backup
app.get('/api/admin/export', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  const safeData = {
    ...data,
    auth: { note: 'Credenciales protegidas' },
  };
  return res.json({ success: true, backup: safeData });
});

// ---------------- ADMIN PROFILE CRUD ----------------

app.put('/api/admin/profile', requireAuth, (req: Request, res: Response) => {
  const { name, role, avatarUrl } = req.body;
  const data = db.getData();

  if (!data.siteConfig.adminProfile) {
    data.siteConfig.adminProfile = {
      name: 'Administrador de Mercadeo',
      role: 'Comité de Mercadeo Partners Campus',
      avatarUrl: '',
      updatedAt: new Date().toISOString(),
    };
  }

  if (name !== undefined) data.siteConfig.adminProfile.name = name.trim();
  if (role !== undefined) data.siteConfig.adminProfile.role = role.trim();
  if (avatarUrl !== undefined) data.siteConfig.adminProfile.avatarUrl = avatarUrl.trim();
  data.siteConfig.adminProfile.updatedAt = new Date().toISOString();

  db.commit('Admin', 'Mi perfil', 'Fotografía y datos de perfil actualizados');
  return res.json({ success: true, data: data.siteConfig.adminProfile });
});

app.post('/api/admin/profile/reset-avatar', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  if (!data.siteConfig.adminProfile) {
    data.siteConfig.adminProfile = {
      name: 'Administrador de Mercadeo',
      role: 'Comité de Mercadeo Partners Campus',
      avatarUrl: '',
      updatedAt: new Date().toISOString(),
    };
  } else {
    data.siteConfig.adminProfile.avatarUrl = '';
    data.siteConfig.adminProfile.updatedAt = new Date().toISOString();
  }

  db.commit('Admin', 'Mi perfil', 'Foto de perfil restablecida al avatar predeterminado');
  return res.json({ success: true, data: data.siteConfig.adminProfile });
});

// ---------------- FEATURED MEMBERS CRUD ----------------

app.post('/api/admin/featured-members', requireAuth, (req: Request, res: Response) => {
  const { name, role, month, year, photoUrl, quote, badge, badgeColor, status } = req.body;

  if (!name || !month || !year || !photoUrl) {
    return res.status(400).json({
      success: false,
      error: 'Nombre, mes, año y fotografía son obligatorios',
    });
  }

  const monthNum = Number(month);
  const yearNum = Number(year);

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ success: false, error: 'Mes inválido (debe ser entre 1 y 12)' });
  }

  if (isNaN(yearNum) || yearNum < 2000) {
    return res.status(400).json({ success: false, error: 'Año inválido' });
  }

  const data = db.getData();
  if (!data.featuredMembers) {
    data.featuredMembers = [];
  }

  const memberStatus: 'draft' | 'published' = status === 'draft' ? 'draft' : 'published';

  // Conflict check: only one published member per month/year
  if (memberStatus === 'published') {
    const conflict = data.featuredMembers.find(
      (m) => m.status === 'published' && m.month === monthNum && m.year === yearNum
    );
    if (conflict) {
      return res.status(400).json({
        success: false,
        error: `Ya existe un reconocimiento publicado para este mes y año (${conflict.name}). Puedes guardarlo como borrador o modificar el reconocimiento existente.`,
      });
    }
  }

  const newMember: FeaturedMember = {
    id: `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    role: role ? role.trim() : 'Miembro Destacado',
    month: monthNum,
    year: yearNum,
    photoUrl: photoUrl.trim(),
    quote: quote && quote.trim().length > 0 ? quote.trim() : undefined,
    badge: badge && badge.trim().length > 0 ? badge.trim() : undefined,
    badgeColor: badgeColor || '#FD7C5E',
    status: memberStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.featuredMembers.push(newMember);
  db.commit(
    'Admin',
    'Crear Miembro Destacado',
    `Reconocimiento registrado: ${newMember.name} (${newMember.month}/${newMember.year})`
  );

  return res.json({ success: true, data: newMember });
});

app.put('/api/admin/featured-members/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, role, month, year, photoUrl, quote, badge, badgeColor, status } = req.body;
  const data = db.getData();
  if (!data.featuredMembers) data.featuredMembers = [];

  const member = data.featuredMembers.find((m) => m.id === id);
  if (!member) {
    return res.status(404).json({ success: false, error: 'Reconocimiento no encontrado' });
  }

  const targetMonth = month !== undefined ? Number(month) : member.month;
  const targetYear = year !== undefined ? Number(year) : member.year;
  const targetStatus: 'draft' | 'published' = status !== undefined ? (status === 'draft' ? 'draft' : 'published') : member.status;

  // Conflict check: if setting to published, verify no other published recognition exists for same month and year
  if (targetStatus === 'published') {
    const conflict = data.featuredMembers.find(
      (m) => m.id !== id && m.status === 'published' && m.month === targetMonth && m.year === targetYear
    );
    if (conflict) {
      return res.status(400).json({
        success: false,
        error: `Ya existe un reconocimiento publicado para este mes y año (${conflict.name}). Puedes guardarlo como borrador o modificar el existente.`,
      });
    }
  }

  if (name !== undefined) member.name = name.trim();
  if (role !== undefined) member.role = role.trim();
  if (month !== undefined) member.month = targetMonth;
  if (year !== undefined) member.year = targetYear;
  if (photoUrl !== undefined) member.photoUrl = photoUrl.trim();
  if (quote !== undefined) member.quote = quote.trim().length > 0 ? quote.trim() : undefined;
  if (badge !== undefined) member.badge = badge.trim().length > 0 ? badge.trim() : undefined;
  if (badgeColor !== undefined) member.badgeColor = badgeColor;
  if (status !== undefined) member.status = targetStatus;
  member.updatedAt = new Date().toISOString();

  db.commit(
    'Admin',
    'Editar Miembro Destacado',
    `Reconocimiento actualizado: ${member.name} (${member.month}/${member.year})`
  );

  return res.json({ success: true, data: member });
});

app.delete('/api/admin/featured-members/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  if (!data.featuredMembers) data.featuredMembers = [];

  const index = data.featuredMembers.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Reconocimiento no encontrado' });
  }

  const removed = data.featuredMembers.splice(index, 1)[0];
  db.commit(
    'Admin',
    'Eliminar Miembro Destacado',
    `Reconocimiento eliminado: ${removed.name} (${removed.month}/${removed.year})`
  );

  return res.json({ success: true, message: 'Reconocimiento eliminado con éxito' });
});

// ---------------- CHATBOT PROXY & MANAGEMENT ----------------

app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Mensaje vacío o inválido' });
  }

  const data = db.getData();
  const chatbot = data.siteConfig.chatbot;

  if (chatbot && chatbot.enabled === false) {
    return res.status(503).json({
      success: false,
      error: 'El asistente virtual está desactivado temporalmente.',
    });
  }

  const webhookUrl =
    chatbot?.webhookUrl ||
    'https://porza.app.n8n.cloud/webhook/35e78195-181d-434a-94e4-ae1e2c1d9b6f/chat';

  try {
    const activeSessionId =
      sessionId && typeof sessionId === 'string' && sessionId.trim()
        ? sessionId.trim()
        : `session-${Date.now()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
      },
      body: JSON.stringify({
        action: 'sendMessage',
        chatInput: message.trim(),
        sessionId: activeSessionId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!n8nResponse.ok) {
      const errText = await n8nResponse.text();
      console.error(`n8n webhook error (${n8nResponse.status}):`, errText);
      return res.status(502).json({
        success: false,
        error: `El webhook de n8n respondió con código ${n8nResponse.status}. Verifica que el flujo esté activo en n8n.`,
      });
    }

    const contentType = n8nResponse.headers.get('content-type') || '';
    let reply = '';

    if (contentType.includes('application/json')) {
      const json = await n8nResponse.json();
      if (typeof json === 'string') {
        reply = json;
      } else if (json && typeof json === 'object') {
        reply =
          json.output ||
          json.text ||
          json.response ||
          json.message ||
          json.data?.output ||
          JSON.stringify(json);
      }
    } else {
      reply = await n8nResponse.text();
    }

    return res.json({
      success: true,
      reply: reply || 'Respuesta recibida sin contenido.',
      sessionId: activeSessionId,
    });
  } catch (err: unknown) {
    console.error('Error forwarding message to n8n:', err);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return res.status(504).json({
      success: false,
      error: isAbort
        ? 'El asistente tardó demasiado tiempo en responder (tiempo de espera agotado).'
        : 'No se pudo conectar con el servicio de n8n. Por favor intenta de nuevo en unos momentos.',
    });
  }
});

app.put('/api/admin/chatbot', requireAuth, (req: Request, res: Response) => {
  const { enabled, webhookUrl, title, subtitle, welcomeMessage } = req.body;
  const data = db.getData();

  if (!data.siteConfig.chatbot) {
    data.siteConfig.chatbot = {
      enabled: true,
      title: 'Asistente de Mercadeo',
      subtitle: 'Partners Campus EAFIT • n8n AI',
      welcomeMessage:
        '¡Hola! Soy el asistente virtual de Mercadeo de Partners Campus. ¿En qué te puedo ayudar hoy con copies, ideas de diseño, contenido para redes o campañas?',
      webhookUrl:
        'https://porza.app.n8n.cloud/webhook/35e78195-181d-434a-94e4-ae1e2c1d9b6f/chat',
    };
  }

  if (enabled !== undefined) data.siteConfig.chatbot.enabled = Boolean(enabled);
  if (webhookUrl !== undefined && typeof webhookUrl === 'string') {
    data.siteConfig.chatbot.webhookUrl = webhookUrl.trim();
  }
  if (title !== undefined && typeof title === 'string') {
    data.siteConfig.chatbot.title = title.trim();
  }
  if (subtitle !== undefined && typeof subtitle === 'string') {
    data.siteConfig.chatbot.subtitle = subtitle.trim();
  }
  if (welcomeMessage !== undefined && typeof welcomeMessage === 'string') {
    data.siteConfig.chatbot.welcomeMessage = welcomeMessage.trim();
  }

  db.commit('Admin', 'Configurar Chatbot', 'Ajustes del chatbot de n8n actualizados');

  return res.json({
    success: true,
    data: data.siteConfig.chatbot,
  });
});

// ---------------- VITE / FRONTEND SERVING ----------------

async function setupFrontend() {
  const isProduction = process.env.NODE_ENV === 'production';
  const httpServer = createHttpServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const hmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Share the app's HTTP server so the HMR WebSocket is reachable through the preview proxy
        // instead of Vite's default standalone port (24678).
        hmr: hmrDisabled ? false : { server: httpServer },
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Merc a la Mano 2027 server running on http://0.0.0.0:${PORT}`);
  });
}

setupFrontend().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
