// Función de Vercel que atiende /api/generate, /api/status, /api/upload,
// /api/hooks y /api/health. Toda la lógica vive en server/handlers.js.
import { handleApi } from '../server/handlers.js';

export default async function handler(req, res) {
  const result = await handleApi(String(req.query.route || ''), {
    method: req.method,
    headers: req.headers,
    body: req.body || {},
    query: req.query || {},
  });
  res.status(result.status).json(result.json);
}
