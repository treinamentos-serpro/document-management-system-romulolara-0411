const { unlink } = require('node:fs/promises');

const documents = new Map();

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findAll() {
  return Array.from(documents.values()).reverse();
}

function findById(id) {
  return documents.get(id);
}

async function removeFile(filePath) {
  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

module.exports = { save, findAll, findById, removeFile };