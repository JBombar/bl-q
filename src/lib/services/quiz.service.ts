import { supabase } from '@/lib/supabase/client';
import type { QuizDefinition, QuizQuestionWithOptions, QuizAnswerData } from '@/types';

export async function getQuizBySlug(slug: string): Promise<QuizDefinition | null> {
  // Get quiz
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (quizError || !quiz) return null;

  const quizData = quiz as any;

  // Get questions with options
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*, quiz_options(*)')
    .eq('quiz_id', quizData.id)
    .order('order_index');

  if (questionsError || !questions) throw new Error(`Failed to load questions: ${questionsError?.message || 'Unknown error'}`);

  // Transform the data to match our types
  const questionsWithOptions: QuizQuestionWithOptions[] = (questions as any[]).map((q: any) => ({
    ...q,
    options: (q.quiz_options || []).sort((a: any, b: any) => a.order_index - b.order_index),
  }));

  return {
    ...quizData,
    questions: questionsWithOptions,
    config: quizData.config,
    resultConfig: quizData.result_config,
    offerMapping: quizData.offer_mapping,
  };
}

export async function saveAnswer(sessionId: string, questionId: string, selectedOptionIds: string[], timeSpent?: number): Promise<void> {
  // Get option scores
  const { data: options } = await supabase
    .from('quiz_options')
    .select('id, score_value')
    .in('id', selectedOptionIds);

  const optionsData = (options || []) as any[];
  const answerScore = optionsData.reduce((sum, opt) => sum + (opt.score_value || 0), 0);

  const { error } = await supabase
    .from('quiz_answers')
    .upsert({
      session_id: sessionId,
      question_id: questionId,
      selected_option_ids: selectedOptionIds,
      answer_score: answerScore,
      time_spent_seconds: timeSpent,
    } as any, {
      onConflict: 'session_id,question_id'
    });

  if (error) throw new Error(`Failed to save answer: ${error.message}`);
}

export async function getSessionAnswers(sessionId: string): Promise<QuizAnswerData[]> {
  const { data, error } = await supabase
    .from('quiz_answers')
    .select('question_id, selected_option_ids, answer_value, time_spent_seconds')
    .eq('session_id', sessionId);

  if (error) throw new Error(`Failed to load answers: ${error.message}`);

  const answersData = (data || []) as any[];
  return answersData.map(a => ({
    questionId: a.question_id,
    selectedOptionIds: a.selected_option_ids,
    answerValue: a.answer_value || undefined,
    timeSpent: a.time_spent_seconds || undefined,
  }));
}
