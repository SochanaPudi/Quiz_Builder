import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QBStorage } from '../../services/storage';

const PENDING_KEY = 'qb.pendingSignup';

export default function Role() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  function chooseRole(role) {
    const pending = sessionStorage.getItem(PENDING_KEY);

    if (!pending) {
      // No pending signup (e.g. a returning user picking a role):
      // go straight to the module for that role, as the original did.
      navigate(role === 'creator' ? '/admin/dashboard' : '/user/join');
      return;
    }

    let signupData;

    try {
      signupData = JSON.parse(pending);
    } catch (error) {
      setError('Signup information is invalid. Please start again.');
      return;
    }

    const result = QBStorage.signup(
      signupData.name,
      signupData.email,
      signupData.password,
      role
    );

    if (!result.ok) {
      setError(result.error);
      return;
    }

    sessionStorage.removeItem(PENDING_KEY);
    navigate(role === 'creator' ? '/admin/dashboard' : '/user/join');
  }

  return (
    <main className="role-wrap">
      <section className="role-box">
        <div className="brand">
          <span className="brand-icon">💡</span>
          <span>
            <span className="brand-title">Quiz Builder</span>
            <span className="brand-sub">Create • Play • Learn</span>
          </span>
        </div>

        <div className="role-head">
          <h1>Choose Your Role</h1>
          <p>What would you like to do today?</p>
        </div>

        {error ? <div className="error">{error}</div> : null}

        <div className="role-grid">
          <article className="card role-card creator">
            <div className="role-icon">📝</div>
            <h2>Creator</h2>
            <p>
              Create and manage quizzes, publish codes and view participant results.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => chooseRole('creator')}
            >
              Continue
            </button>
          </article>

          <article className="card role-card participant">
            <div className="role-icon">🎮</div>
            <h2>Participant</h2>
            <p>
              Join a quiz using a code, answer questions and view explanations.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => chooseRole('participant')}
            >
              Continue
            </button>
          </article>
        </div>

        <p className="center auth-links" style={{ marginTop: '20px' }}>
          <Link to="/login">Back to Login</Link>
        </p>
      </section>
    </main>
  );
}
