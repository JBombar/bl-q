import { supabase } from '@/lib/supabase/client';
import type { QuizResult, QuizResultInsert, Json } from '@/types';

// Question types that contribute to scoring
const SCORING_QUESTION_TYPES = [
  'single_choice',
  'multiple_choice',
  'scale',
  'likert_1_4'
];

interface CalculateResultParams {
  sessionId: string;
  quizId: string;
  resultType: string;
  resultConfig: any;
  offerMapping: any;
}

interface CalculationDetails {
  rawScore: number;
  weightedScore: number;
  scoringQuestionsAnswered: number;
  totalScoringQuestions: number;
  totalWeightApplied: number;
  maxPossibleScore: number;
  normalizedScore: number;
  version: string;
}

/**
 * Get existing result for a session (for idempotency)
 */
export async function getExistingResult(sessionId: string): Promise<QuizResult | null> {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error || !data) return null;
  return data as QuizResult;
}

/**
 * Calculate weighted score and determine result segment
 */
export async function calculateResult(params: CalculateResultParams): Promise<QuizResult> {
  const { sessionId, quizId, resultType, resultConfig, offerMapping } = params;

  // Get all answers with question data for weighted scoring
  const { data: answers, error: answersError } = await supabase
    .from('quiz_answers')
    .select(`
      question_id,
      answer_score,
      selected_option_ids
    `)
    .eq('session_id', sessionId);

  if (answersError) throw new Error(`Failed to load answers: ${answersError.message}`);

  const answersData = (answers || []) as any[];

  // Get all scoring questions with their weights
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('id, question_type, weight')
    .eq('quiz_id', quizId)
    .in('question_type', SCORING_QUESTION_TYPES);

  if (questionsError) throw new Error(`Failed to load questions: ${questionsError.message}`);

  const questionsData = (questions || []) as any[];

  // Build question weight map
  const questionWeights = new Map<string, number>();
  questionsData.forEach(q => {
    questionWeights.set(q.id, q.weight ?? 1.0);
  });

  // Calculate max possible score (assuming max 3 per question * weight)
  const MAX_OPTION_SCORE = 3;
  let maxPossibleScore = 0;
  let totalWeightApplied = 0;
  questionsData.forEach(q => {
    const weight = q.weight ?? 1.0;
    maxPossibleScore += MAX_OPTION_SCORE * weight;
    totalWeightApplied += weight;
  });

  // Calculate weighted score
  let rawScore = 0;
  let weightedScore = 0;
  let scoringQuestionsAnswered = 0;

  answersData.forEach(answer => {
    const weight = questionWeights.get(answer.question_id);
    if (weight !== undefined) {
      // This is a scoring question
      const answerScore = answer.answer_score ?? 0;
      rawScore += answerScore;
      weightedScore += answerScore * weight;
      scoringQuestionsAnswered++;
    }
  });

  // Normalize to 0-100 scale
  const normalizedScore = maxPossibleScore > 0
    ? Math.round((weightedScore / maxPossibleScore) * 100)
    : 0;

  // Determine segment based on result type
  let resultValue = '';
  let resultLabel = '';
  let resultDescription = '';

  if (resultType === 'score' || resultType === 'segment') {
    const segments = resultConfig.segments || [];

    // Find segment based on weighted score
    let segment = segments.find((s: any) =>
      weightedScore >= s.minScore && weightedScore <= s.maxScore
    );

    // Fallback: if no segment matches, use highest or lowest
    if (!segment && segments.length > 0) {
      // Sort segments by minScore
      const sortedSegments = [...segments].sort((a: any, b: any) => a.minScore - b.minScore);

      if (weightedScore < sortedSegments[0].minScore) {
        segment = sortedSegments[0];
      } else {
        segment = sortedSegments[sortedSegments.length - 1];
      }
    }

    if (segment) {
      resultValue = segment.id;
      resultLabel = segment.label;
      resultDescription = segment.description;
    }
  }

  // Get product recommendation from offer mapping
  const offer = offerMapping[resultValue] || Object.values(offerMapping)[0];

  // Build calculation details for debugging and future UI
  const calculationDetails: CalculationDetails = {
    rawScore,
    weightedScore,
    scoringQuestionsAnswered,
    totalScoringQuestions: questionsData.length,
    totalWeightApplied,
    maxPossibleScore,
    normalizedScore,
    version: '1.0.0',
  };

  const resultData: QuizResultInsert = {
    session_id: sessionId,
    quiz_id: quizId,
    result_type: resultType,
    result_value: resultValue,
    result_score: weightedScore,
    result_label: resultLabel,
    result_description: resultDescription,
    recommended_product_id: offer?.productId,
    recommended_product_name: offer?.productName,
    recommended_price_cents: offer?.priceCents,
    calculation_method: 'weighted_sum',
    calculation_details: calculationDetails as unknown as Json,
  };

  const { data, error } = await supabase
    .from('quiz_results')
    .upsert(resultData as any, {
      onConflict: 'session_id'
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save result: ${error.message}`);

  return data as QuizResult;
}
