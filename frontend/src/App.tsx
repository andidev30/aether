import { useState } from 'react';

export function App() {
  const [input, setInput] = useState('');

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
        <button type="button" className="app__button" disabled={!input.trim()}>
          Run Audit
        </button>
      </section>
    </main>
  );
}
