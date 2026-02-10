import { supabase } from '@/lib/supabase/client';
import {
  STRESS_STAGE_CONFIG,
  INSIGHT_CARD_CONFIG,
  getStressStage,
  toDisplayScore,
} from '@/config/result-screens.config';
import type {
  QuizInsights,
  InsightCard,
  StressStage,
  FunnelMetadata,
} from '@/types/funnel.types';

interface AnchorQuestionAnswer {
  questionKey: string;
  answerText: string;
}

/**
 * Get anchor question answers for insight cards
 * Fetches answers for q02, q05, q10, q26
 */
export async function getAnchorQuestionAnswers(
  sessionId: string,
  quizId: string
): Promise<AnchorQuestionAnswer[]> {
  // Get anchor question IDs by their keys
  const anchorKeys = INSIGHT_CARD_CONFIG.cards.map(c => c.questionKey);

  console.log('[Insights] Looking for anchor questions:', anchorKeys);

  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('id, question_key')
    .eq('quiz_id', quizId)
    .in('question_key', anchorKeys);

  if (questionsError || !questions?.length) {
    console.error('[Insights] Failed to fetch anchor questions:', questionsError);
    console.error('[Insights] Expected keys:', anchorKeys);
    return [];
  }

  console.log('[Insights] Found anchor questions:', questions);

  // Cast to expected type
  const questionsData = questions as Array<{ id: string; question_key: string | null }>;

  // Build map of question_id -> question_key
  const questionKeyMap = new Map<string, string>();
  questionsData.forEach(q => {
    if (q.question_key) {
      questionKeyMap.set(q.id, q.question_key);
    }
  });

  const questionIds = questionsData.map(q => q.id);

  // Get answers for these questions
  const { data: answers, error: answersError } = await supabase
    .from('quiz_answers')
    .select('question_id, selected_option_ids')
    .eq('session_id', sessionId)
    .in('question_id', questionIds);

  if (answersError || !answers?.length) {
    console.error('[Insights] Failed to fetch anchor answers:', answersError);
    console.error('[Insights] Session ID:', sessionId);
    console.error('[Insights] Question IDs:', questionIds);
    return [];
  }

  console.log('[Insights] Found answers:', answers);

  // Cast to expected type
  const answersData = answers as Array<{ question_id: string; selected_option_ids: string[] }>;

  // Get all selected option IDs to fetch their text
  const allOptionIds = answersData.flatMap(a => a.selected_option_ids || []);

  if (allOptionIds.length === 0) {
    return [];
  }

  const { data: options, error: optionsError } = await supabase
    .from('quiz_options')
    .select('id, option_text')
    .in('id', allOptionIds);

  if (optionsError || !options?.length) {
    console.error('[Insights] Failed to fetch option texts:', optionsError);
    console.error('[Insights] Option IDs:', allOptionIds);
    return [];
  }

  console.log('[Insights] Found options:', options);

  // Cast to expected type
  const optionsData = options as Array<{ id: string; option_text: string }>;

  // Build map of option_id -> option_text
  const optionTextMap = new Map<string, string>();
  optionsData.forEach(opt => {
    optionTextMap.set(opt.id, opt.option_text);
  });

  // Build result array
  const result: AnchorQuestionAnswer[] = [];

  for (const answer of answersData) {
    const questionKey = questionKeyMap.get(answer.question_id);
    if (!questionKey) continue;

    // Get answer text (join multiple for multi-select, take first 2)
    const optionTexts = (answer.selected_option_ids || [])
      .slice(0, 2) // Max 2 for multi-select
      .map((optId: string) => optionTextMap.get(optId))
      .filter(Boolean) as string[];

    const answerText = optionTexts.join(', ') || '';

    result.push({
      questionKey,
      answerText,
    });
  }

  console.log('[Insights] Final anchor answers:', result);
  return result;
}

/**
 * Build insight cards from anchor question answers
 */
export function buildInsightCards(
  anchorAnswers: AnchorQuestionAnswer[]
): InsightCard[] {
  const answerMap = new Map<string, string>();
  anchorAnswers.forEach(a => {
    answerMap.set(a.questionKey, a.answerText);
  });

  return INSIGHT_CARD_CONFIG.cards.map(cardConfig => ({
    cardType: cardConfig.type,
    label: cardConfig.label,
    value: answerMap.get(cardConfig.questionKey) || cardConfig.fallback,
    icon: cardConfig.icon,
  }));
}

/**
 * Get complete insights data for Screen A
 */
export async function getQuizInsights(
  sessionId: string,
  quizId: string,
  normalizedScore: number
): Promise<QuizInsights> {
  // Calculate stress stage (1-4)
  const stressStage = getStressStage(normalizedScore);

  // Get anchor answers and build insight cards
  const anchorAnswers = await getAnchorQuestionAnswers(sessionId, quizId);
  const insightCards = buildInsightCards(anchorAnswers);

  // Build insights response
  return {
    stressStage,
    stageImagePath: STRESS_STAGE_CONFIG.images[stressStage],
    stageTitle: STRESS_STAGE_CONFIG.titles[stressStage],
    stageDescription: STRESS_STAGE_CONFIG.descriptions[stressStage],
    insightCards,
    normalizedScore,
    displayScore: toDisplayScore(normalizedScore),
    maxDisplayScore: 60,
  };
}

/**
 * Get funnel state from session user_metadata
 */
export function extractFunnelState(
  userMetadata: Record<string, unknown> | null
): FunnelMetadata | null {
  if (!userMetadata) return null;

  // Extract funnel-specific fields
  const funnelState: FunnelMetadata = {};

  if (typeof userMetadata.timeCommitmentMinutes === 'number') {
    funnelState.timeCommitmentMinutes = userMetadata.timeCommitmentMinutes as 5 | 10 | 15 | 20;
  }

  if (userMetadata.microCommitments && typeof userMetadata.microCommitments === 'object') {
    funnelState.microCommitments = userMetadata.microCommitments as FunnelMetadata['microCommitments'];
  }

  if (typeof userMetadata.email === 'string') {
    funnelState.email = userMetadata.email;
  }

  if (typeof userMetadata.firstName === 'string') {
    funnelState.firstName = userMetadata.firstName;
  }

  if (typeof userMetadata.funnelStep === 'string') {
    funnelState.funnelStep = userMetadata.funnelStep as FunnelMetadata['funnelStep'];
  }

  if (typeof userMetadata.funnelStartedAt === 'string') {
    funnelState.funnelStartedAt = userMetadata.funnelStartedAt;
  }

  if (typeof userMetadata.funnelCompletedAt === 'string') {
    funnelState.funnelCompletedAt = userMetadata.funnelCompletedAt;
  }

  // Return null if no funnel data exists
  if (Object.keys(funnelState).length === 0) {
    return null;
  }

  return funnelState;
}
