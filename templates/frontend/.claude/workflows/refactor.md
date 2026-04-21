# Frontend Refactor Workflow (Quasar + Vue 3 + TypeScript)

## Objective

Refactor the existing codebase to achieve a clean, scalable, and maintainable architecture without changing functionality, behavior, or UX.

---

## Core Constraints (STRICT)

- DO NOT change business logic behavior
- DO NOT break existing features
- DO NOT introduce regressions
- DO NOT change API contracts
- Refactor incrementally and safely

---

## Step 1 — Analyze Current Code

- Identify:
  - Logic inside pages that should be extracted
  - Repeated UI patterns
  - Inline styles or duplicated styles
  - Mixed responsibilities (UI + logic + API in same file)
  - Tight coupling between components

---

## Step 2 — Define Target Architecture

Apply these principles:

### Structure

src/
├── components/ # Reusable UI components
├── composables/ # Reusable logic (hooks)
├── pages/ # Route-level views
├── layouts/ # App layouts
├── services/ # API & external services
├── stores/ # Global state (if needed)
├── styles/ # Global styles, variables
├── types/ # Shared TypeScript types
├── utils/ # Pure utility functions

---

## Step 3 — Separate Responsibilities

### Pages

- Orchestrate the view
- Call composables
- Pass props to components
- NO heavy logic

### Components

- Pure UI + minimal local logic
- Reusable
- Props-driven
- No API calls

### Composables

- Extract business/UI logic from pages
- Reusable across multiple components/pages
- Handle state + side effects

### Services

- All API calls centralized
- No direct API calls from components/pages

---

## Step 4 — Extract Reusable Logic

Move logic from pages into composables:

Examples:

- form handling → `useForm`
- API calls → `useX`
- stateful logic → `useFeature`

Rules:

- No DOM access inside services
- Composables can manage state and side effects
- Keep composables focused

---

## Step 5 — Component Reusability

When creating components:

- Extract only if reused or clearly reusable
- Avoid over-abstraction
- Prefer composition over inheritance

### Good candidates:

- Buttons
- Inputs
- Cards
- Lists
- Modals

### Rules:

- Use props for configuration
- Emit events for interaction
- Avoid hardcoded values

---

## Step 6 — Styling System

### Global Styles

Define in `/styles/`:

- Colors (variables)
- Typography
- Spacing
- Breakpoints

Use:

- SCSS variables or CSS variables
- Quasar theming where applicable

---

### Component Styles

- Scoped styles per component
- No global leakage
- Avoid inline styles

---

### Rules

- No duplicated styles
- No hardcoded colors
- Use design tokens

---

## Step 7 — State Management

- Use local state by default
- Use global state ONLY when necessary

Global state candidates:

- Auth
- User data
- App settings

Avoid:

- Overusing global stores
- Implicit dependencies

---

## Step 8 — API Layer

- Centralize API logic in `/services`
- Handle:
  - Errors
  - Retries (if needed)
  - Response mapping

NEVER:

- Call API directly from components

---

## Step 9 — Performance

- Avoid unnecessary re-renders
- Use computed instead of watchers when possible
- Lazy load heavy components/pages
- Avoid large reactive objects

For mobile (Capacitor):

- Minimize heavy computations on UI thread
- Optimize lists (virtual scroll if needed)

---

## Step 10 — UX Consistency

- Always handle:
  - Loading states
  - Error states
  - Empty states

- Ensure:
  - Responsive design
  - Smooth interactions
  - No UI blocking

---

## Step 11 — TypeScript Discipline

- Strong typing everywhere
- No `any`
- Define shared types in `/types`
- Use interfaces for props and API responses

---

## Step 12 — Refactor Strategy

Apply refactor in small steps:

1. Extract logic → composables
2. Extract UI → components
3. Centralize API → services
4. Clean styles → global + scoped
5. Remove duplication

After each step:

- Ensure behavior is unchanged
- Validate UI manually

---

## Step 13 — Output Expectations

- Clean, readable, maintainable code
- No duplicated logic
- Clear separation of concerns
- Reusable components
- Consistent styling system

---

## Final Rule

Refactor for clarity and scalability, NOT for abstraction.

Avoid over-engineering.
