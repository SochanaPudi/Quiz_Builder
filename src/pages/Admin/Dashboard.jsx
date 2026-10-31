import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { QBStorage } from '../../services/storage';
import mascotJellyfish from '../../assets/mascot-jellyfish.png';

export default function Dashboard() {
  const user = QBStorage.session();

  const quizzes = QBStorage.owned(user.id);
  const quizIds = quizzes.map(quiz => quiz.id);
  const attempts = QBStorage
    .attempts()
    .filter(attempt => quizIds.includes(attempt.quizId));

  const scores = attempts.map(attempt => attempt.result?.percent || 0);
  const average = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;

  return (
    <AdminLayout active="dashboard">
      <section className="hero card">
        <div className="hero-copy">
          <h1>Dashboard</h1>
          <p>Manage your quizzes and track participant performance.</p>
          <Link className="btn btn-primary" to="/admin/create">＋ Create Quiz</Link>
        </div>
        <img
          className="hero-art"
          src={mascotJellyfish}
          alt="Cute glowing jellyfish mascot"
        />
      </section>

      <div className="grid stats">
        <div className="card stat cyan">
          <div className="ico">▣</div>
          <strong>{quizzes.length}</strong>
          <span>Total Quizzes</span>
        </div>

        <div className="card stat green">
          <div className="ico">♙</div>
          <strong>{attempts.length}</strong>
          <span>Total Attempts</span>
        </div>

        <div className="card stat gold">
          <div className="ico">★</div>
          <strong>{average}%</strong>
          <span>Average Score</span>
        </div>
      </div>

      <h2 className="section-heading">Quick Actions</h2>

      <div className="grid quick">
        <Link className="card card-hover quick-card" to="/admin/create">
          <div className="big">＋</div>
          <strong>Create Quiz</strong>
          <p className="muted small">Build a new quiz</p>
        </Link>

        <Link className="card card-hover quick-card" to="/admin/results">
          <div className="big">▥</div>
          <strong>View Results</strong>
          <p className="muted small">Track participant scores</p>
        </Link>

        <Link className="card card-hover quick-card" to="/admin/quizzes">
          <div className="big">▶</div>
          <strong>Play Your Quiz</strong>
          <p className="muted small">Preview and play a created quiz</p>
        </Link>
      </div>
    </AdminLayout>
  );
}
