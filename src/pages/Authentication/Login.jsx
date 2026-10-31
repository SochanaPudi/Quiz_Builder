import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QBStorage } from '../../services/storage';
import mascotTurtle from '../../assets/mascot-turtle.png';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const result = QBStorage.login(email, password);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError('');
    navigate(result.user.role === 'creator' ? '/admin/dashboard' : '/user/join');
  }

  return (
    <main className="auth">
      <div className="auth-wrap">
        <section className="card auth-card">
          <div className="brand" style={{ marginBottom: '22px' }}>
            <span className="brand-icon">💡</span>
            <span>
              <span className="brand-title">Quiz Builder</span>
              <span className="brand-sub">Create • Play • Learn</span>
            </span>
          </div>

          <h1>Welcome Back!</h1>
          <p className="sub">Login to continue your quiz journey.</p>

          {error ? <div className="error">{error}</div> : null}

          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Login
            </button>
          </form>

          <p className="auth-links">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </section>

        <section className="auth-art">
          <img className="mascot" src={mascotTurtle} alt="Cute glowing turtle mascot" />
          <div className="hand">Good things ahead!</div>
        </section>
      </div>
    </main>
  );
}
