import { Link, useNavigate } from 'react-router-dom';
import { QBStorage } from '../services/storage';

const LINKS = [
  ['dashboard', '⌂', 'Dashboard'],
  ['create', '✎', 'Create Quiz'],
  ['quizzes', '▣', 'Your Quizzes'],
  ['results', '▥', 'Results'],
  ['profile', '♙', 'Profile']
];

const PATHS = {
  dashboard: '/admin/dashboard',
  create: '/admin/create',
  quizzes: '/admin/quizzes',
  results: '/admin/results',
  profile: '/admin/profile'
};

/**
 * Creator sidebar. Mirrors the markup produced by the original
 * QBApp.createSidebar(active).
 */
export default function Sidebar({ active }) {
  const navigate = useNavigate();

  function handleLogout(event) {
    event.preventDefault();
    QBStorage.logout();
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      {LINKS.map(([page, icon, label]) => (
        <Link
          key={page}
          className={`nav-link ${active === page ? 'active' : ''}`}
          to={PATHS[page]}
        >
          <span>{icon}</span>
          {label}
        </Link>
      ))}

      <a className="nav-link logout" href="#" onClick={handleLogout}>
        ⇥ Logout
      </a>
    </aside>
  );
}
