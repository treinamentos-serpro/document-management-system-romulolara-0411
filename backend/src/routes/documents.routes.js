const express = require('express');
const multer = require('multer');
const path = require('node:path');
const { mkdir } = require('node:fs');
const { randomUUID } = require('node:crypto');
const controller = require('../controllers/documents.controller');

const router = express.Router();
const storageDirectory = path.resolve(__dirname, '../../storage');
const allowedExtensions = new Set(['.pdf', '.txt', '.csv', '.docx', '.xlsx', '.pptx']);
const configuredLimit = Number(process.env.DMS_MAX_FILE_SIZE || 10 * 1024 * 1024);

if (!Number.isSafeInteger(configuredLimit) || configuredLimit <= 0) {
  throw new Error('DMS_MAX_FILE_SIZE deve ser um inteiro positivo em bytes.');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      mkdir(storageDirectory, { recursive: true }, (error) => {
        callback(error, storageDirectory);
      });
    },
    filename(req, file, callback) {
      callback(null, randomUUID());
    },
  }),
  limits: { fileSize: configuredLimit, files: 1, fields: 0, parts: 2 },
  fileFilter(req, file, callback) {
    if (!allowedExtensions.has(path.extname(file.originalname).toLowerCase())) {
      return callback(Object.assign(new Error('Tipo de arquivo não permitido.'), { status: 400 }));
    }
    callback(null, true);
  },
});

router.post('/upload', upload.single('file'), controller.upload);
router.get('/documents', controller.list);
router.get('/documents/:id/download', controller.download);

router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === 'LIMIT_FILE_SIZE';
    return res.status(tooLarge ? 413 : 400).json({
      error: tooLarge ? 'Arquivo excede o limite de tamanho.' : 'Upload inválido. Use apenas um arquivo no campo file.',
    });
  }
  const status = error.status === 400 || error.status === 404 ? error.status : 500;
  res.status(status).json({
    error: status === 500 ? 'Não foi possível concluir a operação.' : error.message,
  });
});

module.exports = router;