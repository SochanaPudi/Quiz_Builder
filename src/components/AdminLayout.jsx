import { useNavigate } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { QBStorage } from '../services/storage';

/**
 * Admin (Creator) page shell: topbar + sidebar + main content area,
 * exactly like the original data-topbar / data-sidebar layout skeleton.
 */
export default function AdminLayout({ active, children }) {
  const navigate = useNavigate();
  const user = QBStorage.session();

  function handleLogout() {
    QBStorage.logout();
    navigate('/login');
  }

  return (
    <>
      <Topbar user={user} home="/admin/dashboard" onLogout={handleLogout} />

      <div className="layout">
        <Sidebar active={active} />

        <main className="main">
          {children}
        </main>
      </div>
    </>
  );
}
