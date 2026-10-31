import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { QBStorage } from '../../services/storage';

const CATEGORIES = [
  'Logical Thinking',
  'General Knowledge',
  'Science',
  'Mathematics',
  'Programming',
  'Other'
];

const TYPE_LABELS = {
  'multiple-choice': 'Multiple Choice',
  'true-false': 'True / False',
  'text': 'Text Answer'
};

function padOptions(options) {
  return [...(options || []), '', '', '', ''].slice(0, 4);
}

/** Converts saved quiz questions into editable state, like the original edit loader. */
function toEditableQuestions(savedQuestions = []) {
  return savedQuestions.map(question => ({
    ...question,
    type: question.type || 'multiple-choice',
    options: question.type === 'multiple-choice'
      ? padOptions(question.options)
      : [],
    answer: question.answer ?? 0,
    explanation: question.explanation || '',
    image: question.image || ''
  }));
}

function newQuestion() {
  return {
    id: QBStorage.uid('q'),
    type: 'multiple-choice',
    text: '',
    options: ['', '', '', ''],
    answer: 0,
    explanation: '',
    image: ''
  };
}

/** Reads an image file and returns a resized JPEG data URL (max 900px, like the original). */
function readResizedImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 900;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('quiz');
  const user = QBStorage.session();

  // Applied only when the quiz exists AND belongs to the current creator,
  // exactly like the original edit loader.
  const [initial] = useState(() => {
    const oldQuiz = editingId ? QBStorage.getQuiz(editingId) : null;

    if (oldQuiz && oldQuiz.ownerId === user.id) {
      return {
        isEdit: true,
        title: oldQuiz.title || '',
        category: oldQuiz.category || 'General Knowledge',
        description: oldQuiz.description || '',
        minutes: Math.round((oldQuiz.timeLimitSeconds || 600) / 60),
        questions: toEditableQuestions(oldQuiz.questions || [])
      };
    }

    return {
      isEdit: false,
      title: '',
      category: 'Logical Thinking',
      description: '',
      minutes: 10,
      questions: []
    };
  });

  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState(initial.category);
  const [description, setDescription] = useState(initial.description);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [questions, setQuestions] = useState(initial.questions);
  const [message, setMessage] = useState('');
  const navigateTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(navigateTimerRef.current), []);

  function updateQuestion(index, changes) {
    setQuestions(list => list.map(
      (question, i) => (i === index ? { ...question, ...changes } : question)
    ));
  }

  function changeType(index, type) {
    setQuestions(list => list.map((question, i) => {
      if (i !== index) return question;

      // Same type-switch bookkeeping as the original create page.
      if (type === 'multiple-choice') {
        return {
          ...question,
          type,
          options: padOptions(question.options),
          answer: Number(question.answer) || 0
        };
      }

      if (type === 'true-false') {
        return {
          ...question,
          type,
          options: [],
          answer: question.answer === 'false' ? 'false' : 'true'
        };
      }

      return {
        ...question,
        type,
        options: [],
        answer: typeof question.answer === 'string' ? question.answer : ''
      };
    }));
  }

  function removeQuestion(index) {
    setQuestions(list => list.filter((_, i) => i !== index));
  }

  async function handleImage(index, file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Please choose an image smaller than 8 MB.');
      return;
    }

    try {
      const dataUrl = await readResizedImage(file);
      updateQuestion(index, { image: dataUrl });
    } catch (error) {
      alert('Could not read that image. Please try another file.');
    }
  }

  function addQuestion() {
    setQuestions(list => [...list, newQuestion()]);

    // Focus the new card, like the original did after adding a question.
    setTimeout(() => {
      const cards = document.querySelectorAll('[data-question-index]');
      cards[cards.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cards[cards.length - 1]?.querySelector('[data-text]')?.focus();
    }, 50);
  }

  function saveQuiz() {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const parsedMinutes = Number(minutes);

    if (!trimmedTitle) {
      alert('Please enter a quiz title.');
      return;
    }

    if (!parsedMinutes || parsedMinutes < 1 || parsedMinutes > 120) {
      alert('Please enter a time limit between 1 and 120 minutes.');
      return;
    }

    if (!questions.length) {
      alert('Please add at least one question.');
      return;
    }

    if (questions.some(question => !question.text.trim())) {
      alert('Please enter every question before publishing.');
      return;
    }

    if (questions.some(question =>
      question.type === 'multiple-choice' &&
      question.options.filter(option => option.trim()).length < 2
    )) {
      alert('Each Multiple Choice question must have at least two options.');
      return;
    }

    if (questions.some(question =>
      question.type === 'multiple-choice' &&
      !question.options[Number(question.answer)]?.trim()
    )) {
      alert('Please enter the option selected as the correct answer.');
      return;
    }

    if (questions.some(question =>
      question.type === 'text' && !String(question.answer || '').trim()
    )) {
      alert('Please enter at least one accepted answer for every Text Answer question.');
      return;
    }

    const existing = initial.isEdit ? QBStorage.getQuiz(editingId) : null;

    let saved;

    try {
      saved = QBStorage.saveQuiz({
        id: existing?.id,
        title: trimmedTitle,
        description: trimmedDescription,
        category,
        timeLimitSeconds: parsedMinutes * 60,
        ownerId: user.id,
        ownerName: user.name,
        questions,
        code: existing?.code
      });
    } catch (error) {
      alert(error.message || 'Could not save the quiz.');
      return;
    }

    setMessage(`Quiz published successfully! Share code: ${saved.code}`);

    navigateTimerRef.current = setTimeout(() => {
      navigate('/admin/quizzes');
    }, 1400);
  }

  return (
    <AdminLayout active="create">
      <div className="page-head">
        <div>
          <h1>{initial.isEdit ? 'Edit Quiz' : 'Create Quiz'}</h1>
          <p>Create your quiz, add questions, set correct answers and provide explanations.</p>
        </div>
      </div>

      <section className="card pad">
        <form className="form" onSubmit={event => event.preventDefault()}>
          <div className="create-info-grid">
            <div className="field">
              <label htmlFor="title">Quiz Title</label>
              <input
                id="title"
                required
                maxLength={100}
                placeholder="e.g. Brain Booster – Logical Thinking Challenge"
                value={title}
                onChange={event => setTitle(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={event => setCategory(event.target.value)}
              >
                {CATEGORIES.map(item => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe what participants will learn or test..."
              value={description}
              onChange={event => setDescription(event.target.value)}
            />
          </div>

          <div className="field time-field">
            <label htmlFor="time">Time Limit (minutes)</label>
            <input
              id="time"
              type="number"
              min="1"
              max="120"
              required
              value={minutes}
              onChange={event => setMinutes(event.target.value)}
            />
            <span className="hint">
              Participants will be automatically submitted when the timer reaches zero.
            </span>
          </div>
        </form>
      </section>

      <div className="steps create-steps">
        <span className="step active">① Question</span>
        <span className="step">② Options</span>
        <span className="step">③ Explanation</span>
      </div>

      <section aria-live="polite">
        {!questions.length ? (
          <div className="card pad empty-questions">
            <div className="empty-icon">＋</div>
            <h2>No questions yet</h2>
            <p className="muted">
              Click <strong>Add Question</strong> to create your first question.
            </p>
          </div>
        ) : (
          questions.map((question, index) => (
            <article
              key={question.id}
              className="card question-box"
              data-question-index={index}
            >
              <div className="q-head">
                <div>
                  <span className="q-number">Question {index + 1}</span>
                  <span className="q-status">{TYPE_LABELS[question.type]}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => removeQuestion(index)}
                >
                  Remove Question
                </button>
              </div>

              <div className="type-tabs">
                <button
                  type="button"
                  className={`type-tab ${question.type === 'multiple-choice' ? 'active' : ''}`}
                  onClick={() => changeType(index, 'multiple-choice')}
                >
                  Multiple Choice
                </button>
                <button
                  type="button"
                  className={`type-tab ${question.type === 'true-false' ? 'active' : ''}`}
                  onClick={() => changeType(index, 'true-false')}
                >
                  True / False
                </button>
                <button
                  type="button"
                  className={`type-tab ${question.type === 'text' ? 'active' : ''}`}
                  onClick={() => changeType(index, 'text')}
                >
                  Text Answer
                </button>
              </div>

              <div className="field question-prompt-field">
                <label htmlFor={`question-${index}`}>Question</label>
                <textarea
                  id={`question-${index}`}
                  data-text="1"
                  rows={4}
                  maxLength={500}
                  placeholder="Type the complete question here..."
                  value={question.text}
                  onChange={event => updateQuestion(index, { text: event.target.value })}
                />
                <span className="hint">
                  Give participants enough space and information to understand the question clearly.
                </span>
              </div>

              <div className="field upload-field">
                <label htmlFor={`image-${index}`}>Question Image (optional)</label>
                <input
                  id={`image-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={event => handleImage(index, event.target.files?.[0])}
                />
                <div className="upload-note">
                  Add an image for puzzles, diagrams or visual questions. The image is resized before saving.
                </div>
                {question.image ? (
                  <img
                    className="image-preview"
                    src={question.image}
                    alt="Question preview"
                  />
                ) : null}
              </div>

              {question.type === 'multiple-choice' ? (
                <div className="question-options">
                  <div className="section-label">Answer Options</div>
                  <div className="option-grid">
                    {question.options.map((option, optionIndex) => (
                      <div className="option-row" key={optionIndex}>
                        <span className="option-letter">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <input
                          value={option}
                          placeholder={`Option ${optionIndex + 1}`}
                          maxLength={150}
                          onChange={event => {
                            const nextOptions = [...question.options];
                            nextOptions[optionIndex] = event.target.value;
                            updateQuestion(index, { options: nextOptions });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {question.type === 'multiple-choice' ? (
                <div className="field">
                  <label>Correct Answer</label>
                  <select
                    value={Number(question.answer)}
                    onChange={event => updateQuestion(index, { answer: Number(event.target.value) })}
                  >
                    {question.options.map((option, optionIndex) => (
                      <option key={optionIndex} value={optionIndex}>
                        {String.fromCharCode(65 + optionIndex)} — {option || `Option ${optionIndex + 1}`}
                      </option>
                    ))}
                  </select>
                  <span className="hint">Choose the option that should be marked correct.</span>
                </div>
              ) : null}

              {question.type === 'true-false' ? (
                <div className="field">
                  <label>Correct Answer</label>
                  <select
                    value={String(question.answer)}
                    onChange={event => updateQuestion(index, { answer: event.target.value })}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              ) : null}

              {question.type === 'text' ? (
                <div className="field">
                  <label>Accepted Text Answers</label>
                  <input
                    value={question.answer || ''}
                    placeholder="Example: Seven | 7"
                    onChange={event => updateQuestion(index, { answer: event.target.value })}
                  />
                  <span className="hint">
                    Separate alternatives with |. Capitalisation and extra spaces are ignored.
                  </span>
                </div>
              ) : null}

              <div className="field explanation-field">
                <label htmlFor={`explanation-${index}`}>Explanation (optional)</label>
                <textarea
                  id={`explanation-${index}`}
                  rows={4}
                  maxLength={500}
                  placeholder="Explain why the correct answer is correct. Participants will see this after submitting the quiz."
                  value={question.explanation}
                  onChange={event => updateQuestion(index, { explanation: event.target.value })}
                />
              </div>
            </article>
          ))
        )}
      </section>

      <div className="create-actions">
        <button type="button" className="btn btn-primary" onClick={addQuestion}>
          ＋ Add Question
        </button>
        <button type="button" className="btn" onClick={saveQuiz}>
          ✓ Publish Quiz
        </button>
      </div>

      {message ? <div className="success" role="status">{message}</div> : null}
    </AdminLayout>
  );
}
