# Skill: Testing

## Core Principles

- Test behavior, not implementation
- Prefer integration tests over mocks
- Tests must be deterministic and isolated
- Each test must be independent
- Cover both success and failure paths

---

## Scope

Test:
- business logic (services)
- HTTP behavior (controllers)
- auth and critical flows

Do not test:
- type definitions
- infrastructure utilities
- third-party internals

---

## Structure

- Each test sets up its own data
- Database is reset between tests
- No shared mutable state
- No reliance on execution order

---

## Assertions

- Always assert status codes
- Always assert response structure
- For errors: assert error codes
- For success: assert key data fields

---

## Isolation

- Reset state before each test
- No cross-test dependencies
- No hidden global state

---

## Async

- Use async/await only
- No callbacks or timers
- Handle promise rejections explicitly

---

## Anti-Patterns

- Mocking core behavior instead of testing it
- Tests that always pass without meaningful assertions
- Shared data between tests
- Testing implementation details instead of outcomes
- Ignoring error paths

---

## Checklist

- Happy path covered
- Error cases covered
- Tests are independent
- No hidden state
- Assertions are meaningful
- New logic is tested