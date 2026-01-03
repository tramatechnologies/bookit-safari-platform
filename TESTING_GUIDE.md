# Testing Guide

## Overview

This guide covers how to write and run tests for the BookIt Safari application using Jest and React Testing Library.

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Project Structure

```
src/
├── __tests__/
│   ├── setup.ts              # Jest configuration and mocks
│   ├── test-utils.tsx        # Custom render function with providers
│   ├── utils.test.ts         # Utility function tests
│   ├── hooks.test.tsx        # Custom hook tests
│   └── components/           # Component tests
├── lib/
│   ├── utils.ts
│   └── constants.ts
└── components/
    └── [component files]
```

## Test Files

### Unit Tests

#### Utility Function Tests (`src/__tests__/utils.test.ts`)

Tests for pure functions and utilities.

**Example:**
```typescript
describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency values correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });
  });
});
```

#### Hook Tests (`src/__tests__/hooks.test.tsx`)

Tests for custom React hooks.

**Example:**
```typescript
describe('useAuth Hook', () => {
  it('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <QueryClientProvider>{children}</QueryClientProvider>,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });
});
```

### Component Tests

Place component tests in `src/__tests__/components/`.

**Example: `Button.test.tsx`**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    const button = screen.getByRole('button', { name: /click/i });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Integration Tests

Test how components and hooks work together.

**Example: Auth Flow Test**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Auth } from '@/pages/Auth';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

describe('Auth Component', () => {
  const renderAuth = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Auth />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should display sign in form by default', () => {
    renderAuth();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('should switch to sign up form when clicking register', async () => {
    renderAuth();
    const registerLink = screen.getByRole('button', { name: /create account/i });
    
    await userEvent.click(registerLink);
    
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. Test Behavior, Not Implementation

**❌ Bad:**
```typescript
it('should call setState', () => {
  const setUser = jest.fn();
  // Tests implementation detail
});
```

**✅ Good:**
```typescript
it('should display user name after login', async () => {
  // Tests user-facing behavior
  render(<Dashboard />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

### 2. Use Semantic Queries

**❌ Bad:**
```typescript
const button = container.querySelector('.btn-primary');
```

**✅ Good:**
```typescript
const button = screen.getByRole('button', { name: /submit/i });
```

### 3. Test User Interactions

**❌ Bad:**
```typescript
component.click();
```

**✅ Good:**
```typescript
await userEvent.click(screen.getByRole('button'));
```

### 4. Avoid Testing Implementation Details

**❌ Bad:**
```typescript
expect(component.state.count).toBe(1);
```

**✅ Good:**
```typescript
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### 5. Use Proper Async Testing

**❌ Bad:**
```typescript
setTimeout(() => {
  expect(result).toBe(expected);
}, 100);
```

**✅ Good:**
```typescript
await waitFor(() => {
  expect(result).toBe(expected);
});
```

## Mocking

### Mock API Calls

```typescript
import { jest } from '@jest/globals';

const mockBookingsApi = {
  getUserBookings: jest.fn().mockResolvedValue([
    { id: '1', schedule_id: '1', ... },
  ]),
};
```

### Mock Supabase Client

```typescript
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
    from: jest.fn(),
  },
}));
```

### Mock Hooks

```typescript
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: '1', email: 'test@example.com' },
    loading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
  })),
}));
```

## Coverage Goals

Current threshold settings in `jest.config.ts`:

```typescript
coverageThresholds: {
  global: {
    branches: 50,      // 50% of branches
    functions: 50,     // 50% of functions
    lines: 50,         // 50% of lines
    statements: 50,    // 50% of statements
  },
}
```

To improve coverage:

1. **Utility Functions**: Aim for 100% coverage
2. **Custom Hooks**: Aim for 80%+ coverage
3. **Components**: Aim for 70%+ coverage
4. **Pages**: Aim for 50%+ coverage
5. **API Layers**: Aim for 80%+ coverage

## Common Testing Patterns

### Testing Authentication Flow

```typescript
it('should redirect to dashboard after successful login', async () => {
  const mockNavigate = jest.fn();
  jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
  }));

  render(<Auth />);
  
  await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'password123');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', expect.any(Object));
  });
});
```

### Testing Form Validation

```typescript
it('should show validation errors', async () => {
  render(<BookingForm />);
  
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
});
```

### Testing Loading States

```typescript
it('should show loading spinner while fetching data', async () => {
  render(<ScheduleSearch />);
  
  expect(screen.getByRole('progressbar')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  expect(screen.getByText(/dar es salaam to arusha/i)).toBeInTheDocument();
});
```

### Testing Error Handling

```typescript
it('should display error message on API failure', async () => {
  const mockError = new Error('Network error');
  jest.spyOn(bookingsApi, 'getUserBookings').mockRejectedValueOnce(mockError);

  render(<MyBookings />);

  await waitFor(() => {
    expect(screen.getByText(/failed to load bookings/i)).toBeInTheDocument();
  });
});
```

## Debugging Tests

### Use `screen.debug()`

```typescript
it('should display user info', () => {
  render(<UserProfile />);
  screen.debug(); // Prints the current DOM
});
```

### Use `screen.logTestingPlaygroundURL()`

```typescript
it('should display user info', () => {
  render(<UserProfile />);
  screen.logTestingPlaygroundURL(); // Prints link to Testing Playground
});
```

### Use `userEvent.setup()` for Better Control

```typescript
it('should validate form', async () => {
  const user = userEvent.setup();
  render(<BookingForm />);

  await user.type(screen.getByLabelText(/email/i), 'invalid');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
});
```

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
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
