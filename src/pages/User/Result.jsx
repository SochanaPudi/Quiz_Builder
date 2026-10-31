import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { QBStorage } from '../../services/storage';
import mascotPenguin from '../../assets/mascot-penguin.png';

export default function Result() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attempt');
  const attempt = QBStorage.getAttempt(attemptId);
  const backLink = attempt?.creatorPreview ? '/admin/quizzes' : '/user/join';

  return (
    <>
      <Topbar home={backLink} chip="Quiz Result" />

      <main className="main">
        {!attempt ? (
          <section className="card result-card">
            <h1>No result found</h1>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/user/join')}
            >
              Back to Join
            </button>
          </section>
        ) : (
          <>
            <section className="card result-card">
              <img
                className="result-mascot"
                src={mascotPenguin}
                alt="Cute glowing penguin mascot"
              />
              <h1>✨ Quiz Completed! ✨</h1>
              <p className="muted">
                {attempt.quizTitle} · {attempt.participantName}
              </p>
              <div className="score">
                {attempt.result.correct}/{attempt.result.total}
              </div>
              <h2>{attempt.result.percent}%</h2>
              <p>
                <span className="pill">✓ Correct {attempt.result.correct}</span>
                {' '}
                <span className="pill">✕ Wrong {attempt.result.wrong}</span>
                {' '}
                <span className="pill">– Skipped {attempt.result.skipped}</span>
              </p>
              <a className="btn btn-primary" href="#review">
                View Answers &amp; Explanation
              </a>
              {' '}
              <Link className="btn" to={backLink}>
                {attempt.creatorPreview ? 'Back to Your Quizzes' : 'Back to Home'}
              </Link>
            </section>

            <section className="review" id="review">
              <h2>Answer Review &amp; Explanation</h2>
              {attempt.result.details.map((detail, index) => (
                <article
                  key={detail.questionId}
                  className={`card review-item ${detail.correct ? 'correct' : 'wrong'}`}
                >
                  <strong>
                    {index + 1}. {detail.text}
                  </strong>

                  <div className="review-row">
                    Your Answer:
                    <span className={detail.correct ? 'correct-text' : 'wrong-text'}>
                      {detail.givenText}
                    </span>
                  </div>

                  <div className="review-row">
                    Correct Answer:
                    <span className="correct-text">
                      {detail.correctText}
                    </span>
                  </div>

                  {detail.explanation ? (
                    <div className="explanation">
                      <strong>Explanation:</strong>
                      {' '}
                      {detail.explanation}
                    </div>
                  ) : null}
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </>
  );
}
