import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Page Not Found — Quiz Builder';
  }, []);

  return (
    <div className="role-wrap">
      <section className="role-box center">
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <span className="brand-icon">💡</span>
          <span>
            <span className="brand-title">Quiz Builder</span>
            <span className="brand-sub">Create • Play • Learn</span>
          </span>
        </div>

        <div className="card pad center" style={{ padding: 38 }}>
          <div className="role-icon" style={{ textShadow: '0 0 18px currentColor' }}>🧭</div>
          <h1>Page Not Found</h1>
          <p className="muted">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
            <button type="button" className="btn btn-primary" onClick={() => navigate(-1)}>
              Go Back
            </button>
            <Link className="btn" to="/">Go Home</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
