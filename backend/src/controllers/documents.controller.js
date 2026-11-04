const service = require('../services/documents.service');

async function upload(req, res) {
  const document = await service.upload(req.file);
  res.status(201).json(document);
}

function list(req, res) {
  res.json(service.list());
}

function download(req, res, next) {
  const document = service.getDownload(req.params.id);
  res.download(document.filePath, document.originalName, (error) => {
    if (!error) return;
    if (error.code === 'ENOENT') {
      return next(Object.assign(new Error('Arquivo não encontrado.'), { status: 404 }));
    }
    next(error);
  });
}

module.exports = { upload, list, download };