# Quiz API Testing Documentation

## Overview

This document provides manual testing procedures for all Quiz API endpoints in Phase 2.

---

## Prerequisites

1. **Database**: Supabase database with schema deployed
2. **Seed Data**: Run `supabase/seed_test_quiz.sql` to create test quiz
3. **Environment**: `.env` file configured with Supabase credentials
4. **Server**: Next.js dev server running (`npm run dev`)

---

## Test Suite

### Test 1: POST /api/quiz/start

**Purpose**: Initialize a quiz session and load quiz definition.

**Request**:
```bash
curl -X POST http://localhost:3000/api/quiz/start \
  -H "Content-Type: application/json" \
  -d '{"slug": "stress-quiz"}'
```

**Expected Response** (200 OK):
```json
{
  "sessionId": "uuid-here",
  "quiz": {
    "id": "uuid-here",
    "slug": "stress-quiz",
    "title": "Stress Assessment Quiz",
    "description": "Discover your stress level...",
    "status": "active",
    "version": 1,
    "questions": [
      {
        "id": "uuid-here",
        "question_text": "How often do you feel overwhelmed...",
        "question_type": "single_choice",
        "order_index": 0,
        "options": [
          {
            "id": "uuid-here",
            "option_text": "Rarely or never",
            "score_value": 0
          }
        ]
      }
    ],
    "resultConfig": {
      "segments": [...]
    },
    "offerMapping": {...}
  }
}
```

**Validation**:
- [ ] Response status is 200
- [ ] `sessionId` is a valid UUID
- [ ] `quiz.questions` is an array with 10 items
- [ ] Each question has 4 options
- [ ] Cookie `qb_sid` is set (check browser DevTools or response headers)
- [ ] Database: New record in `quiz_sessions` table
- [ ] Database: New event in `quiz_events` with type `session_started`

**Error Cases**:
```bash
# Missing slug
curl -X POST http://localhost:3000/api/quiz/start \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 Bad Request - "Quiz slug required"

# Invalid slug
curl -X POST http://localhost:3000/api/quiz/start \
  -H "Content-Type: application/json" \
  -d '{"slug": "nonexistent-quiz"}'
# Expected: 404 Not Found - "Quiz not found"
```

---

### Test 2: POST /api/quiz/answer

**Purpose**: Save user's answer to a question.

**Prerequisites**: Must have active session from Test 1.

**Request**:
```bash
curl -X POST http://localhost:3000/api/quiz/answer \
  -H "Content-Type: application/json" \
  -H "Cookie: qb_sid=<session-token-from-test-1>" \
  -d '{
    "questionId": "<first-question-id>",
    "selectedOptionIds": ["<first-option-id>"],
    "timeSpentSeconds": 5
  }'
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "currentQuestionIndex": 1
}
```

**Validation**:
- [ ] Response status is 200
- [ ] `currentQuestionIndex` increments (0 → 1)
- [ ] Database: New/updated record in `quiz_answers` table
- [ ] Database: `quiz_sessions.current_question_index` updated to 1
- [ ] Database: New event in `quiz_events` with type `answer_saved`

**Error Cases**:
```bash
# No session cookie
curl -X POST http://localhost:3000/api/quiz/answer \
  -H "Content-Type: application/json" \
  -d '{"questionId": "test", "selectedOptionIds": ["test"]}'
# Expected: 401 Unauthorized - "No active session"

# Invalid request data
curl -X POST http://localhost:3000/api/quiz/answer \
  -H "Cookie: qb_sid=<token>" \
  -d '{"questionId": "test"}'
# Expected: 400 Bad Request - "Invalid request data"
```

---

### Test 3: POST /api/quiz/complete

**Purpose**: Calculate quiz result and return product offer.

**Prerequisites**: Must have answered all 10 questions (or at least a few for testing).

**Request**:
```bash
curl -X POST http://localhost:3000/api/quiz/complete \
  -H "Content-Type: application/json" \
  -H "Cookie: qb_sid=<session-token>"
```

**Expected Response** (200 OK):
```json
{
  "result": {
    "id": "uuid-here",
    "session_id": "uuid-here",
    "result_type": "segment",
    "result_value": "medium",
    "result_score": 45.5,
    "result_label": "Moderate Stress",
    "result_description": "You have some stress to address...",
    "recommended_product_id": "prod_stress_management",
    "recommended_product_name": "Stress Management Course",
    "recommended_price_cents": 4999,
    "calculation_method": "weighted_sum"
  },
  "offer": {
    "productId": "prod_stress_management",
    "productName": "Stress Management Course",
    "description": "Comprehensive 4-week stress management program",
    "priceCents": 4999,
    "currency": "usd"
  }
}
```

**Validation**:
- [ ] Response status is 200
- [ ] `result.result_score` is between 0-100
- [ ] `result.result_value` matches a segment ('low', 'medium', or 'high')
- [ ] `offer` matches the result segment from `offerMapping`
- [ ] Database: New record in `quiz_results` table
- [ ] Database: `quiz_sessions.completed_at` is set
- [ ] Database: New event in `quiz_events` with type `quiz_completed`

**Result Score Mapping**:
- Score 0-33 → 'low' segment → Relaxation Guide ($19.99)
- Score 34-66 → 'medium' segment → Stress Management Course ($49.99)
- Score 67-100 → 'high' segment → Personal Coaching ($99.99)

**Error Cases**:
```bash
# No session
curl -X POST http://localhost:3000/api/quiz/complete
# Expected: 401 Unauthorized
```

---

### Test 4: GET /api/quiz/session

**Purpose**: Retrieve current session state, answers, and result.

**Request**:
```bash
curl http://localhost:3000/api/quiz/session \
  -H "Cookie: qb_sid=<session-token>"
```

**Expected Response** (200 OK):
```json
{
  "session": {
    "id": "uuid-here",
    "quiz_id": "uuid-here",
    "session_token": "token-here",
    "current_question_index": 10,
    "completed_at": "2026-01-24T...",
    "progress": {
      "totalQuestions": 0,
      "answeredQuestions": 10,
      "percentComplete": 0,
      "currentQuestion": null
    },
    "answers": [
      {
        "questionId": "uuid",
        "selectedOptionIds": ["uuid"],
        "timeSpent": 5
      }
    ],
    "result": {
      "result_value": "medium",
      "result_score": 45.5
    }
  }
}
```

**Validation**:
- [ ] Response status is 200
- [ ] `session.answers` array contains all saved answers
- [ ] `session.result` is present if quiz completed
- [ ] `session.completed_at` is set if completed

**Error Cases**:
```bash
# No session
curl http://localhost:3000/api/quiz/session
# Expected: 401 Unauthorized
```

---

### Test 5: GET /api/quiz/stress-quiz

**Purpose**: Fetch quiz definition (cacheable, no session required).

**Request**:
```bash
curl http://localhost:3000/api/quiz/stress-quiz
```

**Expected Response** (200 OK):
```json
{
  "id": "uuid-here",
  "slug": "stress-quiz",
  "title": "Stress Assessment Quiz",
  "questions": [...],
  "config": {...},
  "resultConfig": {...},
  "offerMapping": {...}
}
```

**Validation**:
- [ ] Response status is 200
- [ ] `Cache-Control` header present: `public, s-maxage=300, stale-while-revalidate=600`
- [ ] No session cookie required
- [ ] Same data structure as `/api/quiz/start` response

**Error Cases**:
```bash
# Invalid slug
curl http://localhost:3000/api/quiz/nonexistent
# Expected: 404 Not Found
```

---

## End-to-End Flow Test

**Complete Quiz Journey**:

```bash
# Step 1: Start quiz
RESPONSE=$(curl -s -X POST http://localhost:3000/api/quiz/start \
  -H "Content-Type: application/json" \
  -d '{"slug": "stress-quiz"}' \
  -c cookies.txt)

SESSION_ID=$(echo $RESPONSE | jq -r '.sessionId')
FIRST_QUESTION=$(echo $RESPONSE | jq -r '.quiz.questions[0].id')
FIRST_OPTION=$(echo $RESPONSE | jq -r '.quiz.questions[0].options[0].id')

echo "Session: $SESSION_ID"

# Step 2: Answer first question
curl -X POST http://localhost:3000/api/quiz/answer \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"questionId\": \"$FIRST_QUESTION\", \"selectedOptionIds\": [\"$FIRST_OPTION\"], \"timeSpentSeconds\": 5}"

# Step 3: Answer remaining 9 questions (repeat with different questions)
# ... (abbreviated for brevity)

# Step 4: Complete quiz
curl -X POST http://localhost:3000/api/quiz/complete \
  -b cookies.txt

# Step 5: Check session state
curl http://localhost:3000/api/quiz/session \
  -b cookies.txt
```

**Validation**:
- [ ] All steps complete without errors
- [ ] Session persists across all requests
- [ ] Final result calculation is correct based on selected options

---

## Database Verification Queries

After running tests, verify data integrity:

```sql
-- Check session created
SELECT * FROM quiz_sessions
WHERE session_token = '<token-from-cookie>'
ORDER BY created_at DESC
LIMIT 1;

-- Check answers saved
SELECT
  qa.question_id,
  qa.selected_option_ids,
  qa.answer_score,
  qq.question_text
FROM quiz_answers qa
JOIN quiz_questions qq ON qq.id = qa.question_id
WHERE qa.session_id = '<session-id>'
ORDER BY qq.order_index;

-- Check result calculated
SELECT * FROM quiz_results
WHERE session_id = '<session-id>';

-- Check events tracked
SELECT
  event_type,
  event_data,
  created_at
FROM quiz_events
WHERE session_id = '<session-id>'
ORDER BY created_at;

-- Verify score calculation
SELECT
  SUM(answer_score) as total_score,
  COUNT(*) as answer_count
FROM quiz_answers
WHERE session_id = '<session-id>';
```

---

## Performance Benchmarks

**Target Response Times** (p95):

- POST /api/quiz/start: < 200ms
- POST /api/quiz/answer: < 100ms
- POST /api/quiz/complete: < 300ms
- GET /api/quiz/session: < 150ms
- GET /api/quiz/[slug]: < 100ms (cached)

**Load Testing** (optional):
```bash
# Use Apache Bench or similar tool
ab -n 100 -c 10 http://localhost:3000/api/quiz/stress-quiz
```

---

## Success Criteria Checklist

Phase 2 API is complete when:

- [ ] All 5 API endpoints return correct responses
- [ ] Session cookie persists across requests
- [ ] Answers are saved correctly to database
- [ ] Result calculation produces correct segment and offer
- [ ] Events are tracked in `quiz_events` table
- [ ] All error cases handled gracefully
- [ ] TypeScript compiles with no errors (`npm run type-check`)
- [ ] All database queries use proper indexes (verify with EXPLAIN)
- [ ] Response times meet performance targets

---

## Known Issues / Notes

- `session.progress.totalQuestions` is 0 in `/api/quiz/session` response - Frontend will calculate this
- Session expiration cleanup not implemented (Phase 7 - Analytics)
- Email capture not yet implemented (will be added when needed)

---

**Last Updated**: 2026-01-24
**Phase**: 2 - Quiz Data Layer & API
**Status**: Ready for Testing
