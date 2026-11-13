import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { rm } from 'node:fs/promises';
import { createApp } from '../src/app.js';

const tmpDir = path.join(os.tmpdir(), 'linksnip-test-' + Date.now());
process.env.DATA_FILE = path.join(tmpDir, 'links.json');
process.env.ADMIN_TOKEN = 'test-token';

let server, baseUrl;

before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await rm(tmpDir, { recursive: true, force: true });
});

test('/health возвращает ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ok');
});

test('создаёт короткую ссылку', async () => {
  const res = await fetch(`${baseUrl}/api/links`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' })
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.ok(body.code);
  assert.ok(body.shortUrl.endsWith('/' + body.code));
});

test('отклоняет невалидный URL', async () => {
  const res = await fetch(`${baseUrl}/api/links`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'not-a-url' })
  });
  assert.equal(res.status, 400);
});

test('редиректит по коду', async () => {
  const created = await (await fetch(`${baseUrl}/api/links`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.org' })
  })).json();
  const res = await fetch(`${baseUrl}/${created.code}`, { redirect: 'manual' });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), 'https://example.org');
});

test('DELETE требует admin-токен', async () => {
  const created = await (await fetch(`${baseUrl}/api/links`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.net' })
  })).json();

  const noAuth = await fetch(`${baseUrl}/api/links/${created.code}`, { method: 'DELETE' });
  assert.equal(noAuth.status, 401);

  const ok = await fetch(`${baseUrl}/api/links/${created.code}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': 'test-token' }
  });
  assert.equal(ok.status, 204);
});