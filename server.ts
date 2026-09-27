/**
 * GovTrack - Full-Stack Express Server with Vite Middleware
 * Runs on Port 3000
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './src/server/routes/api.ts';
import { initializeDatabase } from './src/server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Initialize DB (supports optional Mongoose or memory store)
  await initializeDatabase();

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount REST API
  app.use('/api', apiRouter);

  if (!isProduction) {
    // Development mode: Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[GovTrack Server] Vite dev middleware mounted.');
  } else {
    // Production mode: Serve built static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[GovTrack Server] Serving production build from dist/');
  }

  app.listen(PORT, () => {
    console.log(`[GovTrack Server] Live and running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[GovTrack Server] Fatal startup error:', err);
  process.exit(1);
});
