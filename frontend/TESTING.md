# Testing Guide

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are located alongside components:

```
src/
├── components/
│   └── dashboard/
│       ├── StatsOverview.tsx
│       └── StatsOverview.test.tsx
```

## Example Test

```typescript
import { render, screen } from '@testing-library/react'
import { StatsOverview } from './StatsOverview'

describe('StatsOverview', () => {
  it('renders stats correctly', () => {
    render(<StatsOverview />)
    expect(screen.getByText('Total Validators')).toBeInTheDocument()
  })
})
```

## Testing Best Practices

1. Test user interactions, not implementation details
2. Use `@testing-library/react` for component tests
3. Mock Web3 providers for wallet-related tests
4. Test error states and edge cases
5. Keep tests simple and focused