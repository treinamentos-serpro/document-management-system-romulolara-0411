import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documents';

export default function UploadComponent({ onUploaded, disabled = false }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || isUploading || disabled) return;

    setIsUploading(true);
    setError('');
    setMessage('');
    try {
      const document = await uploadDocument(file);
      onUploaded(document);
      setFile(null);
      inputRef.current.value = '';
      setMessage('Documento enviado com sucesso.');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-title">
      <div>
        <p className="section-label">NOVO DOCUMENTO</p>
        <h2 id="upload-title">Enviar arquivo</h2>
      </div>
      <form onSubmit={handleSubmit} aria-busy={isUploading}>
        <label htmlFor="document-file">Arquivo</label>
        <div className="upload-controls">
          <input
            ref={inputRef}
            id="document-file"
            type="file"
            accept=".pdf,.txt,.csv,.docx,.xlsx,.pptx"
            required
            disabled={disabled || isUploading}
            onChange={(event) => {
              setFile(event.target.files[0] || null);
              setError('');
              setMessage('');
            }}
          />
          <button type="submit" disabled={disabled || isUploading || !file}>
            {isUploading ? 'Enviando...' : 'Enviar documento'}
          </button>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
        <p className="success-message" role="status">{message}</p>
      </form>
    </section>
  );
}