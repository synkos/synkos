# Skill: Security

## Core Principles

- Validate all inputs at the boundary
- Never trust client-provided data
- Authenticate before authorizing
- Minimize data exposure
- Secrets must never appear in code or logs
- Fail safely on optional features

---

## Input Validation

- Validate body, params, and query before any logic
- Enforce constraints (length, format, type)
- Reject invalid input early

---

## Authentication & Authorization

- Always derive identity from authenticated context
- Never trust user-provided identifiers
- Enforce ownership checks on user-scoped data
- Use least privilege (role-based access when needed)

---

## Data Exposure

- Never return raw database objects
- Use explicit DTOs
- Exclude sensitive fields by default
- Do not leak internal errors or structure

---

## Secrets & Environment

- No hardcoded secrets
- Do not access environment variables directly without validation
- Never log sensitive data (tokens, passwords, headers)

---

## Request Handling

- Apply rate limiting on public endpoints
- Avoid revealing resource existence (prefer safe error responses)
- Ensure consistent error formats

---

## Async & External Systems

- Handle all async failures safely
- External integrations must not crash the system
- Do not trust third-party payloads without verification

---

## Common Risks

- Missing input validation
- Missing ownership checks
- Overexposed data in responses
- Logging sensitive information
- Weak or missing authentication
- Trusting external tokens without verification

---

## Checklist

- Inputs validated
- Auth enforced
- Ownership verified
- Sensitive data excluded
- Secrets protected
- Errors safe and consistent