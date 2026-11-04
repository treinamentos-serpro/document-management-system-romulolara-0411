import assert from 'node:assert/strict';
import { test } from 'node:test';
import { downloadDocument, listDocuments, uploadDocument } from './documents.js';

test('lista documentos via /api e encaminha o sinal de cancelamento', async (context) => {
  const documents = [{ id: '123', originalName: 'arquivo.txt' }];
  const controller = new AbortController();
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/documents');
    assert.equal(options.signal, controller.signal);
    return Response.json(documents);
  });
  assert.deepEqual(await listDocuments({ signal: controller.signal }), documents);
});

test('envia arquivo em FormData no campo file sem definir Content-Type', async (context) => {
  const file = new File(['conteudo'], 'arquivo.txt', { type: 'text/plain' });
  const document = { id: '123', originalName: file.name };
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/upload');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers, undefined);
    assert.equal(options.body.get('file').name, file.name);
    assert.equal(await options.body.get('file').text(), 'conteudo');
    return Response.json(document, { status: 201 });
  });
  assert.deepEqual(await uploadDocument(file), document);
});

test('baixa o conteúdo binário e codifica o identificador', async (context) => {
  context.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url, '/api/documents/id%2F123/download');
    return new Response('conteudo', { headers: { 'Content-Type': 'text/plain' } });
  });
  assert.equal(await (await downloadDocument('id/123')).text(), 'conteudo');
});

test('preserva mensagens de erro do backend em todas as operações', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'Documento não encontrado.' }, { status: 404 }));
  await assert.rejects(listDocuments(), /Documento não encontrado/);
  await assert.rejects(uploadDocument(new File([''], 'arquivo.txt')), /Documento não encontrado/);
  await assert.rejects(downloadDocument('123'), /Documento não encontrado/);
});

test('trata respostas de erro sem JSON', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => new Response('Bad Gateway', { status: 502 }));
  await assert.rejects(listDocuments(), /Não foi possível concluir a operação/);
});

test('trata falhas de conexão e preserva cancelamentos', async (context) => {
  const fetchMock = context.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(listDocuments(), /Não foi possível conectar ao servidor/);
  fetchMock.mock.mockImplementation(async () => { throw new DOMException('Aborted', 'AbortError'); });
  await assert.rejects(listDocuments(), { name: 'AbortError' });
});