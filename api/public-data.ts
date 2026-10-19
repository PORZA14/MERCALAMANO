import type { Request, Response } from 'express';
import { db } from '../server/db.ts';

export default async function handler(_req: Request, res: Response) {
  try {
    await db.sync();
  } catch {
    return res.status(503).json({ success: false, error: 'No se pudo cargar la información guardada' });
  }
  const data = db.getData();
  const sortedTools = [...data.tools]
    .filter((tool) => tool.isActive)
    .sort((a, b) => a.order - b.order);
  const sortedDrives = [...data.committeeDrives]
    .filter((drive) => drive.isActive)
    .sort((a, b) => a.order - b.order);
  const sortedArchives = [...data.historyArchives]
    .filter((archive) => archive.isActive)
    .sort((a, b) => b.year - a.year);
  const sortedMeetings = [...data.meetings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const publishedMembers = [...(data.featuredMembers || [])]
    .filter((member) => member.status === 'published')
    .sort((a, b) => (b.year - a.year) || (b.month - a.month));

  return res.status(200).json({
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
}
