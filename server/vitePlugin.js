// Plugin para `npm run dev`: hace que las rutas /api/* funcionen en tu PC
// igual que en Vercel, sin instalar nada extra. Solo se usa en desarrollo.
import { loadEnv } from 'vite';
import { handleApi } from './handlers.js';

const MAX_BODY_BYTES = 5 * 1024 * 1024; // mismo orden que el límite de Vercel

// Lee el cuerpo JSON de la petición (con límite de tamaño)
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

export function apiDevPlugin() {
  return {
    name: 'studio-api-dev',
    configureServer(server) {
      // Cargamos TODAS las variables del .env (también las que no empiezan con VITE_)
      // en process.env, pero solo para el servidor: nunca llegan al navegador.
      const env = loadEnv(server.config.mode, process.cwd(), '');
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }

      server.middlewares.use('/api', async (req, res) => {
        const url = new URL(req.url, 'http://localhost');
        const name = url.pathname.replace(/^\/+|\/+$/g, '');

        let body = {};
        if (req.method === 'POST') {
          try {
            body = await readJsonBody(req);
          } catch {
            res.statusCode = 413;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'El archivo es muy grande.' }));
            return;
          }
        }

        const result = await handleApi(name, {
          method: req.method,
          headers: req.headers,
          body,
          query: Object.fromEntries(url.searchParams),
        });
        res.statusCode = result.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result.json));
      });
    },
  };
}
