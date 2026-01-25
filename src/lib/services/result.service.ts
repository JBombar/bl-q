import { supabase } from '@/lib/supabase/client';
import type { QuizResult, QuizResultInsert } from '@/types';

interface CalculateResultParams {
  sessionId: string;
  quizId: string;
  resultType: string;
  resultConfig: any;
  offerMapping: any;
}

export async function calculateResult(params: CalculateResultParams): Promise<QuizResult> {
  const { sessionId, quizId, resultType, resultConfig, offerMapping } = params;

  // Get all answers for this session
  const { data: answers, error: answersError } = await supabase
    .from('quiz_answers')
    .select('answer_score')
    .eq('session_id', sessionId);

  if (answersError) throw new Error(`Failed to load answers: ${answersError.message}`);

  const answersData = (answers || []) as any[];
  // Calculate total score
  const totalScore = answersData.reduce((sum, a) => sum + (a.answer_score || 0), 0);

  // Determine segment based on result type
  let resultValue = '';
  let resultLabel = '';
  let resultDescription = '';

  if (resultType === 'score' || resultType === 'segment') {
    // Find segment based on score ranges
    const segments = resultConfig.segments || [];
    const segment = segments.find((s: any) =>
      totalScore >= s.minScore && totalScore <= s.maxScore
    );

    if (segment) {
      resultValue = segment.id;
      resultLabel = segment.label;
      resultDescription = segment.description;
    }
  }

  // Get product recommendation from offer mapping
  const offer = offerMapping[resultValue] || Object.values(offerMapping)[0];

  const resultData: QuizResultInsert = {
    session_id: sessionId,
    quiz_id: quizId,
    result_type: resultType,
    result_value: resultValue,
    result_score: totalScore,
    result_label: resultLabel,
    result_description: resultDescription,
    recommended_product_id: offer?.productId,
    recommended_product_name: offer?.productName,
    recommended_price_cents: offer?.priceCents,
    calculation_method: 'weighted_sum',
    calculation_details: { totalScore, answersCount: answersData.length },
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
