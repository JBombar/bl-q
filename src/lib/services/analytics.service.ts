import { supabase } from '@/lib/supabase/client';
import type { QuizEventInsert, Json } from '@/types';

export const EVENT_TYPES = {
  SESSION_STARTED: 'session_started',
  QUESTION_VIEWED: 'question_viewed',
  ANSWER_SAVED: 'answer_saved',
  QUIZ_COMPLETED: 'quiz_completed',
  RESULT_VIEWED: 'result_viewed',
  FUNNEL_STEP_COMPLETED: 'funnel_step_completed',
  EMAIL_CAPTURED: 'email_captured',
  CHECKOUT_STARTED: 'checkout_started',
  PAYMENT_SUBMITTED: 'payment_submitted',
  PAYMENT_SUCCEEDED: 'payment_succeeded',
  PAYMENT_FAILED: 'payment_failed',
  // Subscription events
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  SUBSCRIPTION_UPDATED: 'subscription_updated',
  INVOICE_PAID: 'invoice_paid',
  INVOICE_PAYMENT_FAILED: 'invoice_payment_failed',
  // Upsell events
  UPSELL_ACCEPTED: 'upsell_accepted',
  UPSELL_SKIPPED: 'upsell_skipped',
  // Post-checkout events
  EMAIL_UPDATED: 'email_updated',
} as const;

export async function trackEvent(
  eventType: string,
  data: {
    sessionId?: string;
    quizId?: string;
    eventData?: Record<string, unknown>;
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<void> {
  const eventRecord: QuizEventInsert = {
    session_id: data.sessionId,
    quiz_id: data.quizId,
    event_type: eventType,
    event_data: (data.eventData || {}) as Json,
    user_agent: data.userAgent,
    ip_address: data.ipAddress,
  };

  const { error } = await supabase.from('quiz_events').insert(eventRecord);

  if (error) {
    console.error('Failed to track event:', error);
    // Don't throw - analytics failures shouldn't break the app
  }
}
