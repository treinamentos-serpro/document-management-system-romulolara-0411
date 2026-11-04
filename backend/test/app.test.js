const { test } = require('node:test');
const assert = require('node:assert');
const { readdir, readFile, unlink } = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');
const app = require('../src/app');

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('API de documentos com armazenamento local', async (context) => {
  const server = app.listen(0, '127.0.0.1');
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const storageDirectory = path.resolve(__dirname, '../storage');
  const initialFiles = new Set(await readdir(storageDirectory));
  const content = 'Documento de teste';
  let uploadedId;
  let storedPath;

  context.after(async () => {
    if (storedPath) await unlink(storedPath).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  });

  await context.test('saúde e listagem inicial', async () => {
    const health = await fetch(`${baseUrl}/health`);
    assert.deepStrictEqual(await health.json(), { status: 'ok' });
    const response = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(await response.json(), []);
  });

  await context.test('upload persiste bytes e retorna apenas metadados', async () => {
    const form = new FormData();
    form.append('file', new Blob([content]), 'documento.txt');
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
    assert.strictEqual(response.status, 201);
    const document = await response.json();
    uploadedId = document.id;
    assert.match(document.id, /^[0-9a-f-]{36}$/);
    assert.strictEqual(document.originalName, 'documento.txt');
    assert.strictEqual(document.size, Buffer.byteLength(content));
    assert.strictEqual(document.owner, process.env.DMS_DEFAULT_OWNER || 'default');
    assert.strictEqual(new Date(document.uploadedAt).toISOString(), document.uploadedAt);
    assert.deepStrictEqual(Object.keys(document).sort(), ['id', 'originalName', 'owner', 'size', 'uploadedAt']);
    const newFiles = (await readdir(storageDirectory)).filter((name) => !initialFiles.has(name));
    assert.strictEqual(newFiles.length, 1);
    assert.notStrictEqual(newFiles[0], document.originalName);
    storedPath = path.join(storageDirectory, newFiles[0]);
    assert.strictEqual(await readFile(storedPath, 'utf8'), content);
    const list = await fetch(`${baseUrl}/documents`);
    assert.deepStrictEqual(await list.json(), [document]);
  });

  await context.test('download preserva conteúdo e nome original', async () => {
    const response = await fetch(`${baseUrl}/documents/${uploadedId}/download`);
    assert.strictEqual(response.status, 200);
    assert.match(response.headers.get('content-disposition'), /attachment; filename="documento.txt"/);
    assert.strictEqual(await response.text(), content);
  });

  await context.test('upload ausente, campo errado e extensão inválida retornam 400', async () => {
    const missing = await fetch(`${baseUrl}/upload`, { method: 'POST' });
    assert.strictEqual(missing.status, 400);
    for (const [field, filename] of [['wrong', 'documento.txt'], ['file', 'programa.exe']]) {
      const form = new FormData();
      form.append(field, new Blob([content]), filename);
      const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
      assert.strictEqual(response.status, 400);
      assert.strictEqual(typeof (await response.json()).error, 'string');
    }
    assert.strictEqual((await readdir(storageDirectory)).length, initialFiles.size + 1);
  });

  await context.test('arquivo acima do limite retorna 413 e não permanece no disco', async () => {
    const limit = Number(process.env.DMS_MAX_FILE_SIZE || 10 * 1024 * 1024);
    const form = new FormData();
    form.append('file', new Blob([Buffer.alloc(limit + 1)]), 'grande.txt');
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
    assert.strictEqual(response.status, 413);
    assert.strictEqual(typeof (await response.json()).error, 'string');
    assert.strictEqual((await readdir(storageDirectory)).length, initialFiles.size + 1);
  });

  await context.test('falha nos metadados remove o arquivo e retorna erro genérico', async (testContext) => {
    const repository = require('../src/repositories/documents.repository');
    testContext.mock.method(repository, 'save', () => {
      throw new Error('Detalhes internos da persistência');
    });
    const form = new FormData();
    form.append('file', new Blob([content]), 'falha.txt');
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
    assert.strictEqual(response.status, 500);
    assert.deepStrictEqual(await response.json(), { error: 'Não foi possível concluir a operação.' });
    assert.strictEqual((await readdir(storageDirectory)).length, initialFiles.size + 1);
    const list = await fetch(`${baseUrl}/documents`);
    assert.strictEqual((await list.json()).length, 1);
  });

  await context.test('documento desconhecido e arquivo removido retornam 404', async () => {
    const missing = await fetch(`${baseUrl}/documents/inexistente/download`);
    assert.strictEqual(missing.status, 404);
    await unlink(storedPath);
    const removed = await fetch(`${baseUrl}/documents/${uploadedId}/download`);
    assert.strictEqual(removed.status, 404);
    assert.strictEqual(typeof (await removed.json()).error, 'string');
  });
});
