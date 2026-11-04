import { useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/documents';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError('');

    listDocuments({ signal: controller.signal })
      .then((documents) => {
        if (!controller.signal.aborted) setDocuments(documents);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <span className="brand-mark" aria-hidden="true">DMS</span>
        <div>
          <p className="section-label">DOCUMENT MANAGEMENT SYSTEM</p>
          <h1>Meus documentos</h1>
        </div>
      </header>
      <UploadComponent
        disabled={isLoading}
        onUploaded={(document) => {
          setDocuments((current) => [document, ...current]);
          setError('');
        }}
      />
      <DocumentList
        documents={documents}
        isLoading={isLoading}
        error={error}
        onRetry={() => setReloadKey((current) => current + 1)}
      />
    </main>
  );
}
