export async function startQuiz(slug: string) {
  const response = await fetch('/api/quiz/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug }),
  });

  if (!response.ok) {
    throw new Error(`Failed to start quiz: ${response.statusText}`);
  }

  return response.json();
}

export async function submitAnswer(data: {
  questionId: string;
  selectedOptionIds: string[];
  timeSpentSeconds?: number;
}) {
  const response = await fetch('/api/quiz/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to save answer: ${response.statusText}`);
  }

  return response.json();
}

export async function completeQuiz() {
  const response = await fetch('/api/quiz/complete', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to complete quiz: ${response.statusText}`);
  }

  return response.json();
}

export async function getSession() {
  const response = await fetch('/api/quiz/session');

  if (!response.ok) {
    throw new Error(`Failed to get session: ${response.statusText}`);
  }

  return response.json();
}
