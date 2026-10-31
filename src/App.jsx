import { Navigate, Route, Routes } from 'react-router-dom';
import { QBStorage } from './services/storage';
import Login from './pages/Authentication/Login.jsx';
import Signup from './pages/Authentication/Signup.jsx';
import Role from './pages/Authentication/Role.jsx';
import Dashboard from './pages/Admin/Dashboard.jsx';
import CreateQuiz from './pages/Admin/CreateQuiz.jsx';
import Quizzes from './pages/Admin/Quizzes.jsx';
import Results from './pages/Admin/Results.jsx';
import Profile from './pages/Admin/Profile.jsx';
import Join from './pages/User/Join.jsx';
import Play from './pages/User/Play.jsx';
import Result from './pages/User/Result.jsx';
import TestSeed from './pages/TestSeed.jsx';
import NotFound from './pages/NotFound.jsx';

/**
 * Guard for the Admin (Creator) module.
 * Mirrors the original QBApp.requireRole('creator') behaviour:
 * - no session  -> /login
 * - participant -> their own home (/user/join)
 */
function AdminRoute({ children }) {
  const user = QBStorage.session();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'creator') {
    return <Navigate to="/user/join" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* The original index.html redirected to the signup page. */}
      <Route path="/" element={<Navigate to="/signup" replace />} />

      {/* Authentication module */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/role" element={<Role />} />

      {/* Admin (Creator) module */}
      <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/admin/create" element={<AdminRoute><CreateQuiz /></AdminRoute>} />
      <Route path="/admin/quizzes" element={<AdminRoute><Quizzes /></AdminRoute>} />
      <Route path="/admin/results" element={<AdminRoute><Results /></AdminRoute>} />
      <Route path="/admin/profile" element={<AdminRoute><Profile /></AdminRoute>} />

      {/* User (Participant) module */}
      <Route path="/user/join" element={<Join />} />
      <Route path="/user/play" element={<Play />} />
      <Route path="/user/result" element={<Result />} />

      {/* Demo data seeder (converted from the original test-seed.html) */}
      <Route path="/test-seed" element={<TestSeed />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
