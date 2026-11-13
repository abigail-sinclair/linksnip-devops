import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

export function createStore() {
  const dataFile = process.env.DATA_FILE || path.join(process.cwd(), 'data', 'links.json');
  let cache = null;

  async function load() {
    if (cache) return cache;
    try {
      cache = JSON.parse(await readFile(dataFile, 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') cache = { links: {} };
      else throw err;
    }
    return cache;
  }

  async function persist() {
    await mkdir(path.dirname(dataFile), { recursive: true });
    const tmp = dataFile + '.tmp';
    await writeFile(tmp, JSON.stringify(cache, null, 2));
    await rename(tmp, dataFile);
  }

  return {
    async save(code, url) {
      const data = await load();
      data.links[code] = { url, createdAt: new Date().toISOString() };
      await persist();
    },
    async get(code) {
      const data = await load();
      return data.links[code]?.url || null;
    },
    async list() {
      const data = await load();
      return Object.entries(data.links)
        .map(([code, v]) => ({ code, ...v }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async remove(code) {
      const data = await load();
      if (!data.links[code]) return false;
      delete data.links[code];
      await persist();
      return true;
    }
  };
}