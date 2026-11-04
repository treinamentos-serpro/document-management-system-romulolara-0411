import DownloadButton from './DownloadButton';

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

export default function DocumentList({ documents, isLoading, error, onRetry }) {
  return (
    <section className="documents-section" aria-labelledby="documents-title" aria-busy={isLoading}>
      <div className="section-heading">
        <div>
          <p className="section-label">BIBLIOTECA</p>
          <h2 id="documents-title">Documentos</h2>
        </div>
        <span className="document-count">{documents.length} documento(s)</span>
      </div>
      {isLoading ? (
        <p className="empty-state" role="status">Carregando documentos...</p>
      ) : error ? (
        <div className="empty-state">
          <p className="error-message" role="alert">{error}</p>
          <button className="secondary-button" type="button" onClick={onRetry}>Tentar novamente</button>
        </div>
      ) : documents.length === 0 ? (
        <p className="empty-state">Nenhum documento enviado.</p>
      ) : (
        <ul className="document-list">
          {documents.map((document) => (
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