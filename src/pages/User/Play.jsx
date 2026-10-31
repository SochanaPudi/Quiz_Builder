import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { QBStorage } from '../../services/storage';
import mascotAstronaut from '../../assets/mascot-astronaut.png';

const TYPE_LABELS = {
  'multiple-choice': 'Multiple Choice',
  'true-false': 'True / False',
  'text': 'Text Answer'
};

export default function Play() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const previewQuizId = searchParams.get('quiz');
  const currentUser = QBStorage.session();

  const [phase, setPhase] = useState('booting'); // booting | ready
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);

  const submittedRef = useRef(false);
  const attemptRef = useRef(null);
  attemptRef.current = attempt;

  // Bootstrap: creator preview mode OR resume an active attempt.
  // Mirrors the original play.html bootstrap logic.
  useEffect(() => {
    const isCreatorPreview = currentUser?.role === 'creator' && Boolean(previewQuizId);

    if (isCreatorPreview) {
      const previewQuiz = QBStorage.getQuiz(previewQuizId);

      if (!previewQuiz || previewQuiz.ownerId !== currentUser.id) {
        navigate('/admin/quizzes', { replace: true });
        return;
      }

      if (!previewQuiz.questions?.length) {
        alert('Add at least one question before playing this quiz.');
        navigate(`/admin/create?quiz=${encodeURIComponent(previewQuiz.id)}`, { replace: true });
        return;
      }

      QBStorage.setActive({
        quizId: previewQuiz.id,
        participantName: `${currentUser.name} (Creator Preview)`,
        participantUserId: currentUser.id,
        creatorPreview: true,
        index: 0,
        answers: {},
        endsAt: Date.now() + (previewQuiz.timeLimitSeconds || 600) * 1000
      });

      // Drop the preview param and fall through to loading the active attempt.
      navigate('/user/play', { replace: true });
    }

    const activeAttempt = QBStorage.active();
    const activeQuiz = activeAttempt ? QBStorage.getQuiz(activeAttempt.quizId) : null;

    if (!activeAttempt || !activeQuiz || !activeQuiz.questions?.length) {
      if (activeAttempt && (!activeQuiz || !activeQuiz.questions?.length)) {
        QBStorage.clearActive();
      }

      navigate(
        currentUser?.role === 'creator' ? '/admin/quizzes' : '/user/join',
        { replace: true }
      );
      return;
    }

    setQuiz(activeQuiz);
    setAttempt({
      ...activeAttempt,
      answers: { ...(activeAttempt.answers || {}) },
      index: Math.min(
        Math.max(Number(activeAttempt.index) || 0, 0),
        activeQuiz.questions.length - 1
      )
    });
    setPhase('ready');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(next) {
    QBStorage.setActive({ ...next });
    return next;
  }

  function setAnswer(questionId, value) {
    setAttempt(current => persist({
      ...current,
      answers: { ...current.answers, [questionId]: value }
    }));
  }

  function goTo(index) {
    setAttempt(current => persist({ ...current, index }));
  }

  function finish(autoSubmitted) {
    if (submittedRef.current) return;

    submittedRef.current = true;
    const current = attemptRef.current;

    QBStorage.setActive({ ...current });

    const result = QBStorage.scoreQuiz(quiz, current.answers);
    const savedAttempt = QBStorage.saveAttempt({
      quizId: quiz.id,
      quizTitle: quiz.title,
      quizCode: quiz.code,
      participantName: current.participantName,
      participantUserId: current.participantUserId || '',
      creatorPreview: Boolean(current.creatorPreview),
      answers: current.answers,
      result,
      autoSubmitted
    });

    QBStorage.clearActive();
    navigate(`/user/result?attempt=${encodeURIComponent(savedAttempt.id)}`, { replace: true });
  }

  // Countdown timer with automatic submission, like the original.
  useEffect(() => {
    if (phase !== 'ready') return undefined;

    function updateTimer() {
      const current = QBStorage.active();
      if (!current) return;

      const seconds = Math.max(0, Math.round((current.endsAt - Date.now()) / 1000));
      setSecondsLeft(seconds);

      if (seconds <= 0) {
        finish(true);
      }
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase !== 'ready') {
    return null;
  }

  const question = quiz.questions[attempt.index];
  const progress = Math.round(((attempt.index + 1) / quiz.questions.length) * 100);

  const labels = question.type === 'true-false'
    ? ['True', 'False']
    : question.options || [];

  const timerText = secondsLeft === null
    ? '00:00'
    : `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  const home = attempt.creatorPreview ? '/admin/quizzes' : '/user/join';
  const chipLabel = attempt.creatorPreview
    ? `Creator Preview · ${attempt.participantName.replace(' (Creator Preview)', '')}`
    : `Participant · ${attempt.participantName}`;

  return (
    <>
      <Topbar home={home} chip={chipLabel} />

      <main className="main">
        <div className="play-top">
          <div>
            <h1 className="play-title">{quiz.title}</h1>
            <div className="muted small">
              Question {attempt.index + 1} of {quiz.questions.length}
            </div>
          </div>
          <div className={`timer ${secondsLeft !== null && secondsLeft < 30 ? 'warning' : ''}`}>
            {timerText}
          </div>
        </div>

        <div className="progress" aria-label="Quiz progress">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="play-grid">
          <section className="card pad">
            <div className="pill">{TYPE_LABELS[question.type]}</div>
            <h2 className="play-question">{question.text}</h2>

            {question.image ? (
              <img
                className="question-image play-question-image"
                src={question.image}
                alt="Question image"
              />
            ) : null}

            <div className="answer-list">
              {question.type === 'text' ? (
                <div className="field">
                  <label htmlFor="textAnswer">Your Answer</label>
                  <input
                    id="textAnswer"
                    placeholder="Type your answer"
                    autoComplete="off"
                    value={attempt.answers[question.id] || ''}
                    onChange={event => setAnswer(question.id, event.target.value)}
                  />
                </div>
              ) : (
                labels.map((label, index) => {
                  const value = question.type === 'true-false'
                    ? (index === 0 ? 'true' : 'false')
                    : String(index);
                  const selected = String(attempt.answers[question.id]) === value;

                  return (
                    <label className={`answer ${selected ? 'selected' : ''}`} key={index}>
                      <input
                        type="radio"
                        name="answer"
                        value={value}
                        checked={selected}
                        onChange={() => setAnswer(question.id, value)}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })
              )}
            </div>

            <div className="play-actions">
              <button
                type="button"
                className="btn"
                disabled={attempt.index === 0}
                onClick={() => goTo(attempt.index - 1)}
              >
                ← Previous
              </button>

              {attempt.index === quiz.questions.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => finish(false)}
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => goTo(attempt.index + 1)}
                >
                  Next →
                </button>
              )}
            </div>
          </section>

          <aside className="play-side-art">
            <img
              className="play-art"
              src={mascotAstronaut}
              alt="Cute glowing astronaut mascot"
            />
            <div className="hand center">You can do it!</div>
          </aside>
        </div>
      </main>
    </>
  );
}
