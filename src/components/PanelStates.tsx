interface PanelLoadingProps {
  title: string;
  message: string;
}

export function PanelLoading({ title, message }: PanelLoadingProps) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="panel-loading">
        <div className="spinner" />
        <p>{message}</p>
      </div>
    </section>
  );
}

interface PanelErrorProps {
  title: string;
  error: string;
  onRetry: () => void;
}

export function PanelError({ title, error, onRetry }: PanelErrorProps) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="panel-error">
        <p>⚠ {error}</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    </section>
  );
}
