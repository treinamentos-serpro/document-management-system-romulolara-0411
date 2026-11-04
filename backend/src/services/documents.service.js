const { randomUUID } = require('node:crypto');
const repository = require('../repositories/documents.repository');

function createServiceError(message, status) {
  return Object.assign(new Error(message), { status });
}

function createDocument(file) {
  return {
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: process.env.DMS_DEFAULT_OWNER || 'default',
    filePath: file.path,
  };
}

function toMetadata(document) {
  const { id, originalName, size, uploadedAt, owner } = document;
  return { id, originalName, size, uploadedAt, owner };
}

async function upload(file) {
  if (!file) {
    throw createServiceError('Envie um arquivo no campo file.', 400);
  }

  try {
    return toMetadata(repository.save(createDocument(file)));
  } catch (error) {
    await repository.removeFile(file.path);
    throw error;
  }
}

function list() {
  return repository.findAll().map(toMetadata);
}

function getDownload(id) {
  const document = repository.findById(id);
  if (!document) {
    throw createServiceError('Documento não encontrado.', 404);
  }
  return { filePath: document.filePath, originalName: document.originalName };
}

module.exports = { upload, list, getDownload };