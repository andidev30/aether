import { FormEvent, useState } from 'react';

type LoginProps = {
  onSuccess: () => void;
};

const STATIC_USERNAME = 'admin';
const STATIC_PASSWORD = 'aether123';

export function Login({ onSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username === STATIC_USERNAME && password === STATIC_PASSWORD) {
      setError('');
      onSuccess();
      return;
    }

    setError('Invalid credentials. Try admin / aether123.');
  };

  return (
    <main className="login">
      <section className="login__panel">
        <header className="login__header">
          <h1>Aether Console</h1>
          <p>Sign in with the demo credentials to explore the audit tools.</p>
        </header>

        <form onSubmit={handleSubmit} className="login__form">
          <label htmlFor="username" className="login__label">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="login__input"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin"
          />

          <label htmlFor="password" className="login__label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="login__input"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="aether123"
          />

          {error && <p className="login__error">{error}</p>}

          <button type="submit" className="login__button">
            Sign In
          </button>
        </form>
      </section>
    </main>
  );
}
