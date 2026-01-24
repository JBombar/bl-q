import { QuizContainer } from '@/components/quiz/QuizContainer';

interface QuizPageProps {
  params: Promise<{ quizSlug: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizSlug } = await params;

  return <QuizContainer slug={quizSlug} />;
}

export async function generateMetadata({ params }: QuizPageProps) {
  const { quizSlug } = await params;

  return {
    title: `${quizSlug} Quiz`,
    description: 'Take the quiz to get personalized recommendations',
  };
}
