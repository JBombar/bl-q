# Testing Guide - Quiz Funnel Application

Quick reference for running tests and understanding test coverage.

---

## Running Tests

### Unit & Component Tests (Jest)

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Prerequisites:
# 1. Database seeded with test quiz (slug: 'stress-quiz', 10 questions)
# 2. Development server running (npm run dev)

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI (debug mode)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/quiz-flow.spec.ts

# Run specific browser only
npx playwright test --project=chromium
```

---

## Test Structure

```
tests/
├── api/                    # API integration tests
│   └── quiz-start.test.ts
└── e2e/                    # End-to-end tests
    ├── quiz-flow.spec.ts
    └── session-persistence.spec.ts

src/
├── components/quiz/__tests__/
│   └── QuizQuestion.test.tsx
├── hooks/__tests__/
│   └── useQuizState.test.ts
└── lib/services/__tests__/
    ├── result.service.test.ts
    ├── session.service.test.ts
    └── quiz.service.test.ts
```

---

## Current Coverage

### High Coverage (>90%)
- `result.service.ts` - 96.15%
- `quiz.service.ts` - 96.42%
- `useQuizState.ts` - 89.74%
- `QuizQuestion.tsx` - 96.29%

### Medium Coverage (50-90%)
- `session.service.ts` - 54.54% (cookie functions not testable in Jest)

### Not Yet Tested
- API routes (sample test available)
- Stripe integration (deferred to Phase 5 testing)
- Checkout components (deferred)
- Other quiz UI components

---

## Writing New Tests

### Service Test Example

```typescript
// src/lib/services/__tests__/myservice.test.ts
import { myFunction } from '../myservice';
import { supabase } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client');

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does something', async () => {
    // Arrange
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockData, error: null })
    });

    // Act
    const result = await myFunction();

    // Assert
    expect(result).toEqual(expectedResult);
  });
});
```

### Component Test Example

```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('handles click', async () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('user can do something', async ({ page }) => {
    await page.goto('/path');
    await expect(page.locator('h1')).toBeVisible();
    await page.click('button');
    await expect(page.locator('.result')).toContainText('Success');
  });
});
```

---

## Mock Patterns

### Supabase Client

```typescript
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      }),
      insert: jest.fn().mockResolvedValue({ error: null }),
      update: jest.fn().mockResolvedValue({ error: null }),
    })
  }
}));
```

### Fetch API

```typescript
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: mockData })
});
```

### Zustand Store

```typescript
// Reset store before each test
beforeEach(() => {
  const { result } = renderHook(() => useQuizState());
  act(() => {
    result.current.reset();
  });
});
```

---

## Debugging Tests

### Jest Debug Mode

```bash
# Run specific test file
npm test -- QuizQuestion.test.tsx

# Run specific test by name
npm test -- -t "renders question text"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debug Mode

```bash
# UI mode (visual debugger)
npm run test:e2e:ui

# Headed mode (see browser)
npx playwright test --headed

# Debug specific test
npx playwright test --debug tests/e2e/quiz-flow.spec.ts

# Step through test
PWDEBUG=1 npx playwright test
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

### Vercel Integration

Add to `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "ignoreCommand": "npm test"
}
```

---

## Performance Testing

### Lighthouse CLI

```bash
# Build production bundle
npm run build
npm start

# Run Lighthouse
npx lighthouse http://localhost:3000/q/stress-quiz --view

# Targets:
# Performance: >90
# Accessibility: >95
# Best Practices: >95
# SEO: >90
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Check for:
# - Total bundle < 300KB gzipped
# - Code splitting working
# - No duplicate dependencies
```

---

## Common Issues

### "Cannot find module '@/...'"

**Solution**: Check `jest.config.js` has correct `moduleNameMapper`:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### "localStorage is not defined"

**Solution**: Add to `jest.setup.js`:
```javascript
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  },
});
```

### "Playwright tests fail with timeout"

**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
use: {
  baseURL: 'http://localhost:3000',
  timeout: 30000, // 30 seconds
}
```

### "Test passes locally but fails in CI"

**Solution**: Check for:
- Timezone differences (use UTC in tests)
- Race conditions (add proper waits)
- Environment variables missing
- Database not seeded

---

## Best Practices

1. **Test Behavior, Not Implementation**
   - ✅ Test that button click saves data
   - ❌ Test that specific function was called

2. **Write Descriptive Test Names**
   - ✅ `test('shows error when quiz not found')`
   - ❌ `test('error case')`

3. **Keep Tests Independent**
   - Each test should run in isolation
   - Use `beforeEach` to reset state
   - Don't rely on test execution order

4. **Mock External Dependencies**
   - Mock Supabase, Stripe, external APIs
   - Don't make real API calls in tests
   - Use test databases for E2E tests

5. **Avoid Over-Mocking**
   - Don't mock everything
   - Test real integrations when possible
   - Use E2E tests for critical paths

---

## Test Coverage Goals

| Type | Current | Target |
|------|---------|--------|
| Core Services | 90%+ | 95% |
| Components | 50% | 80% |
| API Routes | 10% | 70% |
| E2E Coverage | Created | All critical flows |

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: 2026-01-24
**Test Suite Version**: 1.0.0
**Total Tests**: 36 passing
