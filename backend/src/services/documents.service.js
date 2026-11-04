const { randomUUID } = require('node:crypto');
const repository = require('../repositories/documents.repository');

function toMetadata(document) {
  const { id, originalName, size, uploadedAt, owner } = document;
  return { id, originalName, size, uploadedAt, owner };
}

async function upload(file) {
  if (!file) {
    throw Object.assign(new Error('Envie um arquivo no campo file.'), { status: 400 });
  }

  try {
    const document = repository.save({
      id: randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: process.env.DMS_DEFAULT_OWNER || 'default',
      filePath: file.path,
    });
    return toMetadata(document);
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
    throw Object.assign(new Error('Documento não encontrado.'), { status: 404 });
  }
  return { filePath: document.filePath, originalName: document.originalName };
}

module.exports = { upload, list, getDownload };