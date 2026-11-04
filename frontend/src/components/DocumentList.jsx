import DownloadButton from './DownloadButton';
import { useState } from 'react';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const sizeFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
});

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${sizeFormatter.format(bytes / 1024)} KB`;
  return `${sizeFormatter.format(bytes / (1024 * 1024))} MB`;
}

function getExtension(fileName) {
  const extensionStart = fileName.lastIndexOf('.');
  if (extensionStart <= 0 || extensionStart === fileName.length - 1) return '';
  return fileName.slice(extensionStart + 1).toLowerCase();
}

export default function DocumentList({ documents, isLoading, error, onRetry }) {
  const [nameQuery, setNameQuery] = useState('');
  const [selectedExtension, setSelectedExtension] = useState('');
  const extensions = [...new Set(documents.map((document) => getExtension(document.originalName)).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second));
  const normalizedQuery = nameQuery.trim().toLocaleLowerCase('pt-BR');
  const filteredDocuments = documents.filter((document) => {
    const matchesName = document.originalName.toLocaleLowerCase('pt-BR').includes(normalizedQuery);
    const matchesExtension = !selectedExtension || getExtension(document.originalName) === selectedExtension;
    return matchesName && matchesExtension;
  });
  const hasActiveFilters = Boolean(normalizedQuery || selectedExtension);

  return (
    <section className="documents-section" aria-labelledby="documents-title" aria-busy={isLoading}>
      <div className="section-heading">
        <div>
          <p className="section-label">BIBLIOTECA</p>
          <h2 id="documents-title">Documentos</h2>
        </div>
        <span className="document-count">
          {hasActiveFilters
            ? `${filteredDocuments.length} de ${documents.length} documento(s)`
            : `${documents.length} documento(s)`}
        </span>
      </div>
      {documents.length > 0 && (
        <div className="document-filters">
          <label>
            Buscar por nome
            <input
              type="search"
              value={nameQuery}
              onChange={(event) => setNameQuery(event.target.value)}
              placeholder="Ex.: relatorio"
            />
          </label>
          <label>
            Extensão
            <select value={selectedExtension} onChange={(event) => setSelectedExtension(event.target.value)}>
              <option value="">Todas as extensões</option>
              {extensions.map((extension) => (
                <option key={extension} value={extension}>.{extension.toUpperCase()}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {isLoading ? (
        <p className="empty-state" role="status">Carregando documentos...</p>
      ) : error ? (
        <div className="empty-state">
          <p className="error-message" role="alert">{error}</p>
          <button className="secondary-button" type="button" onClick={onRetry}>Tentar novamente</button>
        </div>
      ) : documents.length === 0 ? (
        <p className="empty-state">Nenhum documento enviado.</p>
      ) : filteredDocuments.length === 0 ? (
        <div className="empty-state">
          <p role="status">Nenhum documento corresponde aos filtros.</p>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setNameQuery('');
              setSelectedExtension('');
            }}
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <ul className="document-list">
          {filteredDocuments.map((document) => (
            <li className="document-row" key={document.id}>
              <span className="file-badge" aria-hidden="true">
                {document.originalName.split('.').pop().toUpperCase()}
              </span>
              <div className="document-details">
                <h3>{document.originalName}</h3>
                <div className="document-metadata">
                  <span>{formatSize(document.size)}</span>
                  <time dateTime={document.uploadedAt}>{dateFormatter.format(new Date(document.uploadedAt))}</time>
                  <span>{document.owner}</span>
                </div>
              </div>
              <DownloadButton document={document} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}