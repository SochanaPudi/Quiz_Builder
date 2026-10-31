import { Link } from 'react-router-dom';
import mascotJellyfish from '../assets/mascot-jellyfish.png';
import mascotTurtle from '../assets/mascot-turtle.png';

/**
 * Top navigation bar. Mirrors the markup produced by the original
 * QBApp.createTopbar(): brand on the left, user chip on the right.
 *
 * - `user`     -> logged-in chip with avatar + Logout button (Admin pages)
 * - `chip`     -> plain text chip, no logout (Join / Play / Result pages)
 */
export default function Topbar({ user = null, home = '/', chip = null, onLogout }) {
  const avatar = user?.role === 'creator' ? mascotJellyfish : mascotTurtle;

  return (
    <header className="topbar">
      <Link className="brand" to={home}>
        <span className="brand-icon">💡</span>
        <span>
          <span className="brand-title">Quiz Builder</span>
          <span className="brand-sub">Create • Play • Learn</span>
        </span>
      </Link>

      {user ? (
        <div className="user-chip">
          <img className="avatar" src={avatar} alt="" />
          <span>Hello, {user.name}</span>
          <button type="button" className="btn btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="user-chip">{chip}</div>
      )}
    </header>
  );
}
