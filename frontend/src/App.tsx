import { useState } from 'react';
import { Login } from './components/Login';
import { runAudit, type AuditResponse } from './services/audit';

const SAMPLE_LLM_OUTPUT = [
  'The city of Metropolis has reduced its carbon emissions by 60% in the last five years alone.',
  'Most residents now commute using autonomous electric shuttles that are powered entirely by solar energy.',
  'Independent watchdogs have confirmed there have been zero power outages since the new grid went live.'
].join(' ');

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResponse | null>(null);

  const handleRunAudit = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await runAudit({ text: input.trim() });
      setResult(data);
    } catch (auditError) {
      const message = auditError instanceof Error ? auditError.message : 'Unknown audit error';
      setError(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillExample = () => {
    setInput(SAMPLE_LLM_OUTPUT);
    setResult(null);
    setError(null);
  };

  if (!isAuthenticated) {
    return <Login onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>Aether Audit Console</h1>
        <p>Evaluate LLM outputs for bias, hallucination, and evidence confidence.</p>
      </header>

      <section className="app__panel">
        <label htmlFor="audit-input" className="app__label">
          LLM Output
        </label>
        <textarea
          id="audit-input"
          className="app__textarea"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste LLM output here..."
          rows={10}
        />
        <div className="app__actions">
          <button
            type="button"
            className="app__button app__button--secondary"
            onClick={handleFillExample}
            disabled={isLoading}
          >
            Fill With Example
          </button>
          <button
            type="button"
            className="app__button"
            disabled={!input.trim() || isLoading}
            onClick={handleRunAudit}
          >
            {isLoading ? 'Running Audit…' : 'Run Audit'}
          </button>
        </div>

        {error && <p className="app__status app__status--error">{error}</p>}
        {!error && isLoading && <p className="app__status">Evaluating output…</p>}
      </section>

      {result && !isLoading && (
        <section className="app__results" aria-live="polite">
          <h2 className="app__results-title">Audit Results</h2>
          <div className="app__metrics">
            <div className="metric">
              <span className="metric__label">Bias Score</span>
              <span className="metric__value">{result.bias_score.toFixed(2)}</span>
            </div>
            <div className="metric">
              <span className="metric__label">Hallucination Score</span>
              <span className="metric__value">{result.hallucination_score.toFixed(2)}</span>
            </div>
            <div className="metric">
              <span className="metric__label">Source Confidence</span>
              <span className="metric__value">{result.source_confidence.toFixed(2)}</span>
            </div>
          </div>

          <article className="app__explanation">
            <h3>Automated Summary</h3>
            <p>{result.gemini_explanation}</p>
          </article>

          <section className="app__evidence">
            <h3>Supporting Evidence</h3>
            {result.evidence.length === 0 ? (
              <p className="app__status">No relevant documents found for this input.</p>
            ) : (
              <ul className="evidence-list">
                {result.evidence.map((item) => (
                  <li key={item.id} className="evidence-list__item">
                    <header className="evidence-list__header">
                      <span className="evidence-list__title">{item.title}</span>
                      <span className="evidence-list__badge">Similarity {item.similarity.toFixed(2)}</span>
                    </header>
                    {item.summary && <p className="evidence-list__summary">{item.summary}</p>}
                    <footer className="evidence-list__footer">
                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="evidence-list__link"
                        >
                          View source
                        </a>
                      )}
                      {item.published_at && (
                        <span className="evidence-list__meta">Published: {item.published_at}</span>
                      )}
                    </footer>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      )}
    </main>
  );
}
