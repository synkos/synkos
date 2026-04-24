# Skill: API Design

## Core Principles

- Use REST with clear resource-based endpoints
- Each endpoint must have a single responsibility
- Follow correct HTTP semantics (method + status codes)
- Validate all inputs at the boundary
- Separate layers: routes → controller → service
- Return consistent response formats
- Do not leak internal implementation details

---

## Request / Response

### Success
- `{ success: true, data }`
- `{ success: true }` for empty responses

### Error
- `{ success: false, error: { code, message } }`
- Error codes must be consistent and predictable

---

## Endpoint Design

- Use plural resource names
- Avoid deeply nested routes
- Do not overload endpoints with multiple behaviors
- Keep URLs predictable and consistent

---

## Layer Responsibilities

- Routes: define endpoints and middleware only
- Controllers: validate input and call services
- Services: contain business logic and data access
- Models: define data structure only

---

## Validation

- Validate all inputs (body, params, query)
- Reject invalid input early
- Do not perform validation in services

---

## Authorization

- Apply auth at route level
- Use authenticated identity as the source of truth
- Enforce ownership and access rules in services

---

## Data Handling

- Never return raw database objects
- Use explicit DTOs
- Return only required fields

---

## Error Handling

- Use structured error objects
- Use consistent status codes
- Do not expose internal errors

---

## Pagination

- Use explicit pagination parameters
- Return metadata (page, limit, total, hasMore)
- Ensure predictable ordering

---

## Anti-Patterns

- Business logic in controllers
- Validation outside the boundary layer
- Returning database models directly
- Inconsistent response formats
- Overloaded or ambiguous endpoints
- Hidden side effects

---

## Checklist

- Endpoint has clear purpose
- Inputs validated
- Auth applied correctly
- Response format consistent
- Business logic in service layer
- No data overexposure