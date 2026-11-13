import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore } from './store.js';
import { isValidUrl, generateCode } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  const store = createStore();
  const adminToken = process.env.ADMIN_TOKEN || 'dev-token';
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const startedAt = Date.now();
  const counters = { requests: 0, redirects: 0, created: 0 };

  app.use(express.json());
  app.use((req, res, next) => { counters.requests++; next(); });
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: Math.floor((Date.now() - startedAt) / 1000) });
  });

  app.get('/metrics', (req, res) => {
    res.type('text/plain').send(
      `# TYPE linksnip_requests_total counter\nlinksnip_requests_total ${counters.requests}\n` +
      `# TYPE linksnip_redirects_total counter\nlinksnip_redirects_total ${counters.redirects}\n` +
      `# TYPE linksnip_created_total counter\nlinksnip_created_total ${counters.created}\n`
    );
  });

  app.post('/api/links', async (req, res) => {
    const { url } = req.body || {};
    if (!isValidUrl(url)) return res.status(400).json({ error: 'invalid url' });
    const code = generateCode();
    await store.save(code, url);
    counters.created++;
    res.status(201).json({ code, shortUrl: `${baseUrl}/${code}` });
  });

  app.get('/api/links', async (req, res) => {
    res.json({ links: await store.list() });
  });

  app.delete('/api/links/:code', async (req, res) => {
    if (req.header('x-admin-token') !== adminToken) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const ok = await store.remove(req.params.code);
    if (!ok) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  });

  app.get('/:code', async (req, res) => {
    const url = await store.get(req.params.code);
    if (!url) return res.status(404).send('Not found');
    counters.redirects++;
    res.redirect(302, url);
  });

  return app;
}
