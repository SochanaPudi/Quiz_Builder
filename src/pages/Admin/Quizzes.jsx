import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { QBStorage } from '../../services/storage';

export default function Quizzes() {
  const user = QBStorage.session();
  const [quizzes, setQuizzes] = useState(() => QBStorage.owned(user.id));

  function shareCode(code) {
    (async () => {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(code);
        }
        alert(`Quiz code copied: ${code}`);
      } catch (error) {
        alert(`Quiz code: ${code}`);
      }
    })();
  }

  function deleteQuiz(id) {
    const quiz = QBStorage.getQuiz(id);
    if (!quiz) return;

    if (confirm(`Delete "${quiz.title}"?`)) {
      QBStorage.deleteQuiz(quiz.id);
      setQuizzes(QBStorage.owned(user.id));
    }
  }

  return (
    <AdminLayout active="quizzes">
      <div className="page-head">
        <div>
          <h1>Your Quizzes</h1>
          <p>Manage your quizzes and share codes with participants.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/create">＋ Create New Quiz</Link>
      </div>

      <div className="quiz-list">
        {quizzes.length ? (
          quizzes.map(quiz => (
            <article className="card card-hover quiz-row" key={quiz.id}>
              <div>
                <h2 className="quiz-title">🧠 {quiz.title}</h2>
                <div className="quiz-meta">
                  {quiz.category || 'General'}
                  {' · '}
                  {quiz.questions.length} Questions
                  {' · '}
                  {Math.round(quiz.timeLimitSeconds / 60)} min
                </div>
                <div className="quiz-code-wrap">
                  <span className="code">{quiz.code}</span>
                </div>
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => shareCode(quiz.code)}
                >
                  Share Code
                </button>
                <Link
                  className="btn btn-sm"
                  to={`/admin/create?quiz=${encodeURIComponent(quiz.id)}`}
                >
                  Edit
                </Link>
                <Link
                  className="btn btn-sm btn-primary"
                  to={`/user/play?quiz=${encodeURIComponent(quiz.id)}&mode=preview`}
                >
                  ▶ Play
                </Link>
                <Link
                  className="btn btn-sm"
                  to={`/admin/results?quiz=${encodeURIComponent(quiz.id)}`}
                >
                  Results
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteQuiz(quiz.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="card pad center">
            <p className="muted">No quizzes yet.</p>
            <Link className="btn btn-primary" to="/admin/create">
              Create your first quiz
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
