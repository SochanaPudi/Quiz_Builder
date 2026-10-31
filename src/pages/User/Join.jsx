import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { QBStorage } from '../../services/storage';
import mascotTurtle from '../../assets/mascot-turtle.png';

export default function Join() {
  const navigate = useNavigate();
  const sessionUser = QBStorage.session();

  const [code, setCode] = useState('');
  const [player, setPlayer] = useState('');
  const [error, setError] = useState('');
  const [foundQuiz, setFoundQuiz] = useState(null);

  // The original join page sent creators straight to their dashboard.
  if (sessionUser?.role === 'creator') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  function findQuiz() {
    const quiz = QBStorage.getQuizByCode(code);

    if (!quiz) {
      setError('No quiz found with that code.');
      setFoundQuiz(null);
      return;
    }

    if (!quiz.questions?.length) {
      setError('That quiz has no questions.');
      setFoundQuiz(null);
      return;
    }

    setError('');
    setFoundQuiz(quiz);
  }

  function startQuiz() {
    if (!foundQuiz) return;

    const participantName = player.trim() || 'Guest Participant';

    QBStorage.setActive({
      quizId: foundQuiz.id,
      participantName,
      index: 0,
      answers: {},
      endsAt: Date.now() + foundQuiz.timeLimitSeconds * 1000
    });

    navigate('/user/play');
  }

  return (
    <>
      <Topbar home="/user/join" chip="Participant" />

      <main className="main">
        <section className="card join-card pad">
          <img
            className="art"
            src={mascotTurtle}
            alt="Cute glowing turtle mascot"
          />

          <h1>Join a Quiz</h1>
          <p>Enter the quiz code shared by your creator and start playing.</p>

          {error ? <div className="error">{error}</div> : null}

          <div className="form">
            <div className="field">
              <label htmlFor="code">Quiz Code</label>
              <input
                id="code"
                maxLength={6}
                autoComplete="off"
                placeholder="e.g. QZ1234"
                style={{ textTransform: 'uppercase' }}
                value={code}
                onChange={event => setCode(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="player">Your Name</label>
              <input
                id="player"
                maxLength={60}
                placeholder="Enter your name"
                value={player}
                onChange={event => setPlayer(event.target.value)}
              />
            </div>

            <button type="button" className="btn btn-primary btn-block" onClick={findQuiz}>
              Find Quiz
            </button>
          </div>

          {foundQuiz ? (
            <div className="card found">
              <h2>{foundQuiz.title}</h2>
              <p>
                {foundQuiz.category || 'Quiz'}
                {' · '}
                {foundQuiz.questions.length} questions
                {' · '}
                {Math.round(foundQuiz.timeLimitSeconds / 60)} minutes
              </p>
              <button type="button" className="btn btn-primary" onClick={startQuiz}>
                Start Quiz
              </button>
            </div>
          ) : null}

          <p className="center auth-links" style={{ marginTop: '20px' }}>
            <Link to="/login">Login</Link>
            {' · '}
            <Link to="/signup">Sign Up</Link>
          </p>
        </section>
      </main>
    </>
  );
}
