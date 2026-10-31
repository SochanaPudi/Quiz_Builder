import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { QBStorage } from '../../services/storage';

export default function Results() {
  const user = QBStorage.session();
  const [searchParams] = useSearchParams();
  const filterQuiz = searchParams.get('quiz');

  const ownedIds = QBStorage.owned(user.id).map(quiz => quiz.id);
  let attempts = QBStorage
    .attempts()
    .filter(attempt => ownedIds.includes(attempt.quizId));

  if (filterQuiz) {
    attempts = attempts.filter(attempt => attempt.quizId === filterQuiz);
  }

  attempts = [...attempts].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return (
    <AdminLayout active="results">
      <div className="page-head">
        <div>
          <h1>Results</h1>
          <p>View participant submissions for quizzes you created.</p>
        </div>
      </div>

      <section className="card pad table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Quiz</th>
              <th>Score</th>
              <th>Correct</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {attempts.length ? (
              attempts.map(attempt => (
                <tr key={attempt.id}>
                  <td>{attempt.participantName}</td>
                  <td>
                    {attempt.quizTitle}
                    <br />
                    <span className="pill">{attempt.quizCode}</span>
                  </td>
                  <td><strong>{attempt.result.percent}%</strong></td>
                  <td>{attempt.result.correct}/{attempt.result.total}</td>
                  <td>{new Date(attempt.submittedAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="center muted">
                  No participant submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}
