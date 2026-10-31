/**
 * Quiz Builder storage service.
 *
 * Converted 1:1 from the original Shared/storage.js (window.QBStorage) into an
 * ES module. The Local Storage keys, record shapes, password hashing,
 * validation rules, quiz codes and scoring logic are unchanged, so data saved
 * by the original HTML version remains readable and no stored field was
 * renamed.
 */

const KEYS = {
  users: 'qb.users',
  session: 'qb.session',
  quizzes: 'qb.quizzes',
  attempts: 'qb.attempts',
  active: 'qb.activeAttempt'
};

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function hashPassword(password) {
  const value = `qb::${String(password)}`;
  let hash1 = 2166136261;
  let hash2 = 16777331;

  for (let index = 0; index < value.length; index += 1) {
    const characterCode = value.charCodeAt(index);
    hash1 = (hash1 ^ characterCode) >>> 0;
    hash1 = Math.imul(hash1, 16777619) >>> 0;
    hash2 = (Math.imul(hash2, 31) + characterCode) >>> 0;
  }

  return `${hash1.toString(16)}-${hash2.toString(16)}-${value.length.toString(16)}`;
}

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,!?;:]+$/g, '')
    .trim();
}

function makeCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let index = 0; index < 6; index += 1) {
    code += characters[Math.floor(Math.random() * characters.length)];
  }

  return code;
}

function users() {
  return read(KEYS.users, []);
}

function findUser(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return users().find(user => user.email === normalizedEmail) || null;
}

function signup(name, email, password, role) {
  name = String(name || '').trim();
  email = String(email || '').trim().toLowerCase();

  if (!name) {
    return { ok: false, error: 'Please enter your name.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  if (String(password).length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }

  if (findUser(email)) {
    return { ok: false, error: 'An account with this email already exists.' };
  }

  const selectedRole = role === 'participant' ? 'participant' : 'creator';
  const user = {
    id: uid('user'),
    name: name.slice(0, 60),
    email,
    passwordHash: hashPassword(password),
    role: selectedRole,
    createdAt: new Date().toISOString()
  };

  const list = users();
  list.push(user);

  if (!write(KEYS.users, list)) {
    return {
      ok: false,
      error: 'Could not save the account in Local Storage.'
    };
  }

  setSession(user);
  return { ok: true, user: publicUser(user) };
}

function login(email, password) {
  const user = findUser(email);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return { ok: false, error: 'Email or password is incorrect.' };
  }

  setSession(user);
  return { ok: true, user: publicUser(user) };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'creator'
  };
}

function setSession(user) {
  write(KEYS.session, {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    at: Date.now()
  });
}

function session() {
  const currentSession = read(KEYS.session, null);

  if (!currentSession?.userId) return null;

  const user = users().find(item => item.id === currentSession.userId);
  return user ? publicUser(user) : null;
}

function logout() {
  localStorage.removeItem(KEYS.session);
  localStorage.removeItem(KEYS.active);
}

function allQuizzes() {
  return read(KEYS.quizzes, []);
}

function uniqueCode() {
  let code = makeCode();
  const list = allQuizzes();

  while (list.some(quiz => quiz.code === code)) {
    code = makeCode();
  }

  return code;
}

function saveQuiz(quiz) {
  const list = allQuizzes();
  const savedQuiz = {
    ...quiz,
    id: quiz.id || uid('quiz'),
    code: quiz.code || uniqueCode(),
    createdAt: quiz.createdAt || new Date().toISOString(),
    questions: quiz.questions || []
  };

  const index = list.findIndex(item => item.id === savedQuiz.id);

  if (index >= 0) {
    list[index] = savedQuiz;
  } else {
    list.push(savedQuiz);
  }

  if (!write(KEYS.quizzes, list)) {
    throw new Error('Could not save the quiz. Local Storage may be full.');
  }

  return savedQuiz;
}

function getQuiz(id) {
  return allQuizzes().find(quiz => quiz.id === id) || null;
}

function getQuizByCode(code) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  return allQuizzes().find(quiz => quiz.code === normalizedCode) || null;
}

function owned(ownerId) {
  return allQuizzes()
    .filter(quiz => quiz.ownerId === ownerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function attempts() {
  return read(KEYS.attempts, []);
}

function deleteQuiz(id) {
  write(KEYS.quizzes, allQuizzes().filter(quiz => quiz.id !== id));
  write(KEYS.attempts, attempts().filter(attempt => attempt.quizId !== id));
}

function attemptsForQuiz(id) {
  return attempts().filter(attempt => attempt.quizId === id);
}

function getAttempt(id) {
  return attempts().find(attempt => attempt.id === id) || null;
}

function correctText(question) {
  if (question.type === 'multiple-choice') {
    return question.options?.[Number(question.answer)] || '';
  }

  if (question.type === 'true-false') {
    return question.answer === 'true' ? 'True' : 'False';
  }

  return String(question.answer || '').split('|')[0].trim();
}

function givenText(question, answer) {
  if (answer === undefined || answer === null || String(answer).trim() === '') {
    return 'Not answered';
  }

  if (question.type === 'multiple-choice') {
    return question.options?.[Number(answer)] || String(answer);
  }

  if (question.type === 'true-false') {
    return String(answer) === 'true' ? 'True' : 'False';
  }

  return String(answer);
}

function isCorrect(question, answer) {
  if (answer === undefined || answer === null || String(answer).trim() === '') {
    return false;
  }

  if (question.type === 'multiple-choice') {
    return Number(answer) === Number(question.answer);
  }

  if (question.type === 'true-false') {
    return String(answer) === String(question.answer);
  }

  return String(question.answer || '')
    .split('|')
    .map(normalizeText)
    .filter(Boolean)
    .includes(normalizeText(answer));
}

function scoreQuiz(quiz, answers) {
  const details = quiz.questions.map(question => {
    const answer = answers[question.id];
    const answered = answer !== undefined &&
      answer !== null &&
      String(answer).trim() !== '';

    return {
      questionId: question.id,
      type: question.type,
      text: question.text,
      given: answered ? answer : null,
      givenText: givenText(question, answered ? answer : null),
      correctText: correctText(question),
      explanation: question.explanation || '',
      correct: answered && isCorrect(question, answer)
    };
  });

  const correct = details.filter(detail => detail.correct).length;
  const answered = details.filter(detail => detail.given !== null).length;
  const total = details.length;

  return {
    total,
    correct,
    wrong: answered - correct,
    skipped: total - answered,
    percent: total ? Math.round((correct / total) * 100) : 0,
    details
  };
}

function saveAttempt(attempt) {
  const savedAttempt = {
    ...attempt,
    id: attempt.id || uid('attempt'),
    submittedAt: new Date().toISOString()
  };

  const list = attempts();
  list.push(savedAttempt);

  if (!write(KEYS.attempts, list)) {
    throw new Error('Could not save the quiz result.');
  }

  return savedAttempt;
}

export const QBStorage = {
  KEYS,
  uid,
  signup,
  login,
  session,
  logout,
  allQuizzes,
  owned,
  getQuiz,
  getQuizByCode,
  saveQuiz,
  deleteQuiz,
  attempts,
  attemptsForQuiz,
  getAttempt,
  scoreQuiz,
  saveAttempt,
  setActive: value => write(KEYS.active, value),
  active: () => read(KEYS.active, null),
  clearActive: () => localStorage.removeItem(KEYS.active)
};

export default QBStorage;
