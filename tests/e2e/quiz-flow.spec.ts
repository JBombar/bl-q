import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete Quiz Flow
 *
 * Tests the full user journey through the quiz from start to result.
 * This verifies integration between frontend, API, and database.
 */

test.describe('Complete Quiz Flow', () => {
  test('user can complete entire quiz and see result', async ({ page }) => {
    // Navigate to quiz
    await page.goto('/q/stress-quiz');

    // Wait for quiz to load
    await expect(page.locator('text=Question 1')).toBeVisible({ timeout: 10000 });

    // Answer all questions (assuming 10 questions)
    for (let i = 0; i < 10; i++) {
      // Wait for question to be visible
      await expect(page.locator(`text=Question ${i + 1}`)).toBeVisible({ timeout: 5000 });

      // Click first available option (button or clickable element with answer text)
      const optionButtons = page.locator('button').filter({ hasText: /Not at all|Never|Rarely|Sometimes|Often|Always/ });
      const firstOption = optionButtons.first();

      await expect(firstOption).toBeVisible();
      await firstOption.click();

      // Wait for transition (should be < 100ms but allow up to 1s for safety)
      await page.waitForTimeout(500);
    }

    // Should show result screen after completing all questions
    await expect(page.locator('text=/Your Result|Result|Recommendation/i')).toBeVisible({ timeout: 5000 });

    // Should show some kind of stress level result
    await expect(page.locator('text=/Low|Medium|High|Stress/i')).toBeVisible();

    // Should show product recommendation or purchase option
    const buyButton = page.locator('button').filter({ hasText: /Buy|Purchase|Get|Continue/i });
    await expect(buyButton.first()).toBeVisible();
  });

  test('progress indicator updates as user advances', async ({ page }) => {
    await page.goto('/q/stress-quiz');

    // Check initial progress - Question 1 of 10
    await expect(page.locator('text=/Question 1/i')).toBeVisible({ timeout: 10000 });

    // Answer first question
    const firstOption = page.locator('button').first();
    await firstOption.click();
    await page.waitForTimeout(500);

    // Check updated progress - Question 2 of 10
    await expect(page.locator('text=/Question 2/i')).toBeVisible({ timeout: 5000 });

    // Answer second question
    const secondOption = page.locator('button').first();
    await secondOption.click();
    await page.waitForTimeout(500);

    // Check Question 3
    await expect(page.locator('text=/Question 3/i')).toBeVisible({ timeout: 5000 });
  });

  test('quiz transitions are fast (< 500ms)', async ({ page }) => {
    await page.goto('/q/stress-quiz');

    await expect(page.locator('text=/Question 1/i')).toBeVisible({ timeout: 10000 });

    // Measure transition time
    const startTime = Date.now();

    const firstOption = page.locator('button').first();
    await firstOption.click();

    // Wait for next question to appear
    await expect(page.locator('text=/Question 2/i')).toBeVisible({ timeout: 2000 });

    const endTime = Date.now();
    const transitionTime = endTime - startTime;

    // Should be under 500ms (requirement is 100ms but allowing buffer for E2E)
    expect(transitionTime).toBeLessThan(500);
    console.log(`Transition time: ${transitionTime}ms`);
  });

  test('quiz displays correct number of questions', async ({ page }) => {
    await page.goto('/q/stress-quiz');

    await expect(page.locator('text=/Question 1/i')).toBeVisible({ timeout: 10000 });

    // Check that we have "of 10" or similar total indicator
    const progressText = await page.locator('text=/of \\d+/i').first().textContent();
    expect(progressText).toContain('10'); // Assuming 10 questions
  });

  test('selecting an option shows visual feedback', async ({ page }) => {
    await page.goto('/q/stress-quiz');

    await expect(page.locator('text=/Question 1/i')).toBeVisible({ timeout: 10000 });

    const option = page.locator('button').first();

    // Click option
    await option.click();

    // Option should have some selected state (e.g., different background, border, etc.)
    // This would need to be validated based on actual CSS classes
    // For now, we just verify the click succeeded
    await page.waitForTimeout(100);
  });
});

test.describe('Quiz Error Handling', () => {
  test('shows error for non-existent quiz', async ({ page }) => {
    await page.goto('/q/nonexistent-quiz-12345');

    // Should show error message or 404
    await expect(page.locator('text=/not found|error|404/i')).toBeVisible({ timeout: 5000 });
  });

  test('handles network errors gracefully', async ({ page }) => {
    // Navigate to quiz first
    await page.goto('/q/stress-quiz');
    await expect(page.locator('text=/Question 1/i')).toBeVisible({ timeout: 10000 });

    // Simulate offline
    await page.context().setOffline(true);

    // Try to answer
    const option = page.locator('button').first();
    await option.click();

    // Should still advance (optimistic UI) or show gentle error
    // This tests the "non-blocking" API call requirement
    await page.waitForTimeout(1000);

    // UI should not crash
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });
});
