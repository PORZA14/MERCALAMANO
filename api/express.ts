import type { Request, Response } from 'express';
import { app } from '../server.ts';

export default function handler(req: Request, res: Response) {
  const route = req.query.route;
  if (typeof route !== 'string') {
    return res.status(400).json({ success: false, error: 'Ruta API inválida' });
  }

  req.url = `/api/${route}`;
  return app(req, res);
}