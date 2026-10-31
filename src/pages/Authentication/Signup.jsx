import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import mascotJellyfish from '../../assets/mascot-jellyfish.png';

const PENDING_KEY = 'qb.pendingSignup';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setError('');

    // The original app staged signup data in sessionStorage and completed
    // account creation on the role-selection page. Preserved as-is.
    sessionStorage.setItem(
      PENDING_KEY,
      JSON.stringify({
        name,
        email,
        password
      })
    );

    navigate('/role');
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

          <h1>Create Your Account</h1>
          <p className="sub">Join and start your quiz journey!</p>

          {error ? <div className="error">{error}</div> : null}

          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                required
                maxLength={60}
                autoComplete="name"
                placeholder="Enter your name"
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={event => setEmail(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                minLength={6}
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                minLength={6}
                required
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={event => setConfirm(event.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Sign Up
            </button>
          </form>

          <p className="auth-links">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </section>

        <section className="auth-art">
          <img
            className="mascot"
            src={mascotJellyfish}
            alt="Cute glowing jellyfish mascot"
          />
          <div className="hand">Small steps, big dreams!</div>
        </section>
      </div>
    </main>
  );
}
