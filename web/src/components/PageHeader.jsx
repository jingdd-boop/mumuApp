export function PageHeader({ title, subtitle, showBack, onBack }) {
  if (showBack) {
    return (
      <header className="page-header with-back">
        <button type="button" className="back-btn" onClick={onBack} aria-label="返回">
          ‹
        </button>
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </header>
    );
  }

  return (
    <header className="page-header">
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </header>
  );
}
