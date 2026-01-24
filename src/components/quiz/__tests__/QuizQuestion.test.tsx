import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuizQuestion } from '../QuizQuestion';
import { useQuizState } from '@/hooks/useQuizState';

jest.mock('@/hooks/useQuizState');

describe('QuizQuestion Component', () => {
  const mockQuestion = {
    id: 'q1',
    question_text: 'How stressed are you?',
    question_subtext: 'Think about your current stress level',
    question_type: 'single_choice' as const,
    question_order: 1,
    is_required: true,
    options: [
      { id: 'opt1', option_text: 'Not at all', score_value: 0, option_order: 1 },
      { id: 'opt2', option_text: 'A little', score_value: 3.33, option_order: 2 },
      { id: 'opt3', option_text: 'Quite a bit', score_value: 6.66, option_order: 3 },
      { id: 'opt4', option_text: 'Very much', score_value: 10, option_order: 4 },
    ],
  };

  const mockQuizState = {
    selectAnswer: jest.fn(),
    nextQuestion: jest.fn(),
    answers: [],
    quiz: {
      id: 'quiz-1',
      slug: 'stress-quiz',
      title: 'Stress Quiz',
      questions: Array(10).fill(mockQuestion),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuizState as unknown as jest.Mock).mockReturnValue(mockQuizState);
    (useQuizState as any).getState = jest.fn().mockReturnValue(mockQuizState);
  });

  test('renders question text', () => {
    render(<QuizQuestion question={mockQuestion as any} questionIndex={0} />);
    expect(screen.getByText('How stressed are you?')).toBeInTheDocument();
  });

  test('renders question subtext when provided', () => {
    render(<QuizQuestion question={mockQuestion as any} questionIndex={0} />);
    expect(screen.getByText('Think about your current stress level')).toBeInTheDocument();
  });

  test('renders all options', () => {
    render(<QuizQuestion question={mockQuestion as any} questionIndex={0} />);
    expect(screen.getByText('Not at all')).toBeInTheDocument();
    expect(screen.getByText('A little')).toBeInTheDocument();
    expect(screen.getByText('Quite a bit')).toBeInTheDocument();
    expect(screen.getByText('Very much')).toBeInTheDocument();
  });

  test('handles single choice option selection', async () => {
    const mockSelectAnswer = jest.fn().mockResolvedValue(undefined);
    (useQuizState as unknown as jest.Mock).mockReturnValue({
      ...mockQuizState,
      selectAnswer: mockSelectAnswer,
    });

    render(<QuizQuestion question={mockQuestion as any} questionIndex={0} />);

    const option = screen.getByText('A little');
    fireEvent.click(option);

    await waitFor(() => {
      expect(mockSelectAnswer).toHaveBeenCalledWith(
        'q1',
        ['opt2'],
        expect.any(Number)
      );
    });
  });

  test('auto-advances after selecting single choice option', async () => {
    const mockNextQuestion = jest.fn();
    (useQuizState as unknown as jest.Mock).mockReturnValue({
      ...mockQuizState,
      nextQuestion: mockNextQuestion,
    });
    (useQuizState as any).getState = jest.fn().mockReturnValue({
      ...mockQuizState,
      nextQuestion: mockNextQuestion,
    });

    render(<QuizQuestion question={mockQuestion as any} questionIndex={0} />);

    const option = screen.getByText('Not at all');
    fireEvent.click(option);

    // Wait for the 300ms delay plus execution
    await waitFor(() => {
      expect(mockNextQuestion).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  test('calls onComplete when on last question', async () => {
    const mockOnComplete = jest.fn();
    (useQuizState as any).getState = jest.fn().mockReturnValue({
      ...mockQuizState,
      quiz: {
        ...mockQuizState.quiz,
        questions: [mockQuestion], // Only 1 question
      },
    });

    render(
      <QuizQuestion
        question={mockQuestion as any}
        questionIndex={0}
        onComplete={mockOnComplete}
      />
    );

    const option = screen.getByText('Not at all');
    fireEvent.click(option);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  test('loads existing answer when resuming quiz', () => {
    const mockAnswers = [
      { questionId: 'q1', selectedOptionIds: ['opt3'], timeSpent: 5 }
    ];

    (useQuizState as unknown as jest.Mock).mockReturnValue({
      ...mockQuizState,
      answers: mockAnswers,
    });

    render(<QuizQuestion question={mockQuestion as any} questionIndex={0} />);

    // The component should show opt3 as selected (visual test - would need data-testid in real impl)
    // For now we just verify it doesn't crash
    expect(screen.getByText('How stressed are you?')).toBeInTheDocument();
  });

  test('handles multiple choice question type', () => {
    const multipleChoiceQuestion = {
      ...mockQuestion,
      question_type: 'multiple_choice' as const,
    };

    render(<QuizQuestion question={multipleChoiceQuestion as any} questionIndex={0} />);

    // Multiple choice should allow selecting multiple options
    const option1 = screen.getByText('Not at all');
    const option2 = screen.getByText('A little');

    fireEvent.click(option1);
    fireEvent.click(option2);

    // Should not auto-advance on multiple choice
    expect(mockQuizState.nextQuestion).not.toHaveBeenCalled();
  });
});
