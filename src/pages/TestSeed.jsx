import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QBStorage } from '../services/storage';

/**
 * Demo data seeder — converted from the original test-seed.html.
 * Creates (or reuses) the "Creator Test" demo account, seeds one demo quiz,
 * then opens the Admin quiz list. Visit /test-seed to use it.
 */
export default function TestSeed() {
  const navigate = useNavigate();

  useEffect(() => {
    // signup() is a no-op if the account already exists (same as the original).
    QBStorage.signup('Creator Test', 'creator@example.com', 'password', 'creator');

    const user = QBStorage.session();

    if (user) {
      QBStorage.saveQuiz({
        ownerId: user.id,
        ownerName: user.name,
        title: 'Test Quiz',
        description: 'Demo',
        category: 'Logical Thinking',
        timeLimitSeconds: 60,
        questions: [
          {
            id: QBStorage.uid('q'),
            type: 'multiple-choice',
            text: '2 + 2 = ?',
            options: ['3', '4', '5', '6'],
            answer: 1,
            explanation: 'Two plus two is four.'
          }
        ]
      });
    }

    navigate('/admin/quizzes', { replace: true });
  }, [navigate]);

  return null;
}
