# Claude Code — Configuration Guide

This directory contains the project-level configuration for Claude Code. Each mechanism has a specific purpose and load order. This guide explains what exists, why it exists, and how to use each one effectively.

---

## Directory structure

```
.claude/
├── README.md              ← this file
├── settings.json          ← shared project permissions and hooks (committed)
├── settings.local.json    ← personal overrides, never committed (.gitignore)
├── workflows/             ← step-by-step procedures Claude follows on request
│   ├── push-git.yaml
│   ├── sync-templates.yaml
│   └── plan-task.yaml
├── skills/                ← domain knowledge invoked by reference
│   ├── testing.md
│   ├── security.md
│   ├── api-design.md
│   └── performance.md
└── agents/                ← sub-agent role definitions for parallel work
    ├── coder.md
    ├── reviewer.md
    └── tester.md
```

And at the repo root:

```
CLAUDE.md                  ← auto-loaded project context (architecture, commands, conventions)
```

---

## CLAUDE.md — always-on project context

**What it is:** A markdown file auto-loaded by Claude Code at the start of every conversation. Claude reads it before doing anything else.

**What to put here:** Architecture overview, key commands, important relationships between parts of the codebase, conventions that are not obvious from reading the code, and pointers to workflows/skills. Think of it as the README for working *with* Claude on this project — not a README for humans reading the repo.

**What NOT to put here:** Things already obvious from the code (like "we use TypeScript"), exhaustive documentation, task-specific notes, or anything ephemeral.

**Nesting:** You can have a `CLAUDE.md` inside any subdirectory. Claude loads them hierarchically when working inside that folder. Useful for frontend-specific or backend-specific context.

```markdown
<!-- CLAUDE.md example -->
# My Project

## Architecture
This is a monorepo with packages/ (published) and apps/ (dev workspaces).
apps/ changes must be synced to templates/ before they reach users — run pnpm sync:templates.

## Key commands
- pnpm dev:frontend   → start frontend dev server
- pnpm sync:templates → sync apps/ → templates/

## Workflows
- .claude/workflows/push-git.yaml      → how to commit and push
- .claude/workflows/sync-templates.yaml → how to sync and release template changes
```

---

## settings.json — permissions and hooks

**What it is:** Project-level configuration for Claude Code: what shell commands are pre-approved, what commands are blocked, and what hooks run automatically.

**settings.json** is committed and shared with the team. **settings.local.json** is personal and gitignored — use it for per-machine paths or personal preferences.

### Permissions

Pre-approve commands Claude will run often so you don't get a prompt every time. Be specific — prefer allow-listing exact commands over broad wildcards.

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm install *)",
      "Bash(pnpm run build)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(node scripts/*.mjs)"
    ],
    "deny": [
      "Bash(git push --force *)",
      "Bash(rm -rf *)"
    ]
  }
}
```

### Hooks

Hooks are shell commands that run automatically in response to Claude Code events. Claude does not control them — the harness executes them. Use hooks for things you always want to happen, not just when you remember to ask.

Available events:
- `PreToolUse` — before Claude calls a tool (Read, Edit, Bash, etc.)
- `PostToolUse` — after a tool completes
- `Stop` — when Claude finishes a response
- `Notification` — when Claude sends a notification

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          { "type": "command", "command": "pnpm run format --write $FILE" }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "osascript -e 'display notification \"Claude finished\" with title \"Claude Code\"'" }
        ]
      }
    ]
  }
}
```

**Good uses for hooks:**
- Auto-format a file after Claude edits it
- Run type-check after a batch of edits
- Desktop notification when a long task completes
- Log tool calls for auditing

**Bad uses for hooks:** Business logic, complex conditionals, anything that should be a workflow instead.

---

## workflows/ — step-by-step procedures

**What they are:** YAML files that define sequences of steps Claude follows when you explicitly tell it to. They are not automatic — Claude reads them when you say "follow the push-git workflow" or "use the sync-templates workflow."

**What to put here:** Any repeatable process with multiple steps, conditional logic, or conventions that are easy to forget or get wrong. Common examples: git flows, release processes, deployment checklists, sync procedures.

**How to invoke:** Just reference the workflow by name in conversation.
> "Sube los cambios siguiendo el workflow push-git"
> "Sync the templates following sync-templates workflow"

**Format:** YAML with `name`, `description`, `rules`, and `phases`. Phases contain steps with actions.

```yaml
# .claude/workflows/push-git.yaml
name: push-git
description: Stage, commit, and push following monorepo conventions

rules:
  commit-message:
    format: "<type>(<scope>): <description>"
    types: [feat, fix, chore, docs, refactor, test, ci]

  staging:
    - stage specific files, never git add -A
    - never stage pnpm-lock.yaml unless lockfile changed intentionally

  changeset:
    when: any change in packages/ that users will notice
    when-not: apps/, docs/, templates/ changes

phases:
  - phase: pre-commit
    steps:
      - run: git status
      - identify: which packages changed → need changeset?
      - stage: specific files

  - phase: commit
    steps:
      - write message following format above

  - phase: push
    steps:
      - git push origin main
      - if rejected: git pull --rebase → push again
```

**Tip:** Workflows can reference other workflows. `sync-templates.yaml` delegates its push phase to `push-git.yaml`.

---

## skills/ — domain knowledge and coding standards

**What they are:** Markdown files that define standards, principles, and checklists for a specific domain. Claude applies them when you reference a skill in conversation.

**What to put here:** Testing standards, security review checklists, API design conventions, performance guidelines, accessibility requirements. Anything you want Claude to consistently apply but that doesn't fit as a CLAUDE.md convention (too long, too domain-specific, or only sometimes relevant).

**How to invoke:** Reference the skill explicitly.
> "Write tests following the testing skill"
> "Review this for security using the security skill"
> "Design this API following our api-design skill"

```markdown
<!-- .claude/skills/testing.md -->
# Skill: Testing

## Core Principles
- Test behavior, not implementation
- Prefer integration tests over unit mocks
- Each test sets up and tears down its own state

## Scope
Test: business logic, HTTP behavior, auth flows
Do not test: type definitions, third-party internals

## Anti-Patterns
- Mocking core behavior instead of testing it
- Shared mutable state between tests
- Testing implementation details
```

**Difference from CLAUDE.md:** CLAUDE.md is always active and defines project-wide context. Skills are opt-in — you invoke them when relevant. Use skills for detailed domain standards that would bloat CLAUDE.md if always loaded.

---

## agents/ — sub-agent role definitions

**What they are:** Markdown files that define the role, focus, and instructions for a specialized sub-agent. When Claude spawns a sub-agent for parallel work (e.g. code review, running tests, researching a codebase), it can be briefed with an agent definition.

**What to put here:** Role description, what the agent should focus on, what tools it should use, what it should return.

**How to invoke:** Reference them when asking Claude to use sub-agents.
> "Use the reviewer agent to review this PR"
> "Spawn the tester agent to write tests for this service"

```markdown
<!-- .claude/agents/reviewer.md -->
# Agent: Reviewer

## Role
Code reviewer focused on correctness, security, and maintainability.

## Focus areas
- Logic errors and edge cases
- Security vulnerabilities (injection, auth bypass, data exposure)
- API contract violations
- Missing error handling at system boundaries

## What to return
A prioritized list: blockers first, then suggestions, then nits.
One sentence per finding. Include file:line references.

## What to skip
Style issues (handled by linter), test coverage (handled by tester agent).
```

**When to use agents:** Tasks that benefit from parallelism (review + test at the same time), tasks that would pollute the main context with too much output (large codebase exploration), or tasks that need a fresh perspective without prior conversation bias.

---

## Memory — persistent facts across conversations

Memory lives outside the project at `~/.claude/projects/{path}/memory/`. It persists across conversations and sessions.

**What to save there:** User preferences, corrections to Claude's behavior, surprising project decisions, pointers to external resources (Linear, Slack channels, dashboards).

**What NOT to save there:** Architecture docs (→ CLAUDE.md), commands (→ CLAUDE.md), workflows (→ workflows/), anything already in the code.

Memory is automatic — Claude manages it based on what you tell it. You can also ask explicitly: "remember that we always use real databases in tests, never mocks."

---

## Decision guide — where does this go?

| What you want | Where |
|---|---|
| Context Claude always needs | `CLAUDE.md` |
| Commands and key scripts | `CLAUDE.md` |
| Repeatable multi-step process | `workflows/*.yaml` |
| Coding or review standards | `skills/*.md` |
| Sub-agent role for parallel work | `agents/*.md` |
| Pre-approved shell commands | `settings.json` permissions |
| Auto-run something after an edit | `settings.json` hooks |
| Personal machine-specific config | `settings.local.json` |
| User preference or correction | Memory (`~/.claude/projects/.../memory/`) |
| External system pointer (Linear, Slack) | Memory (reference type) |

---

## Load order

When Claude starts a conversation in this repo:

1. `~/.claude/CLAUDE.md` (global, if exists)
2. `CLAUDE.md` (repo root) ← **primary project context**
3. `.claude/settings.json` ← permissions and hooks
4. `settings.local.json` ← personal overrides
5. Memory entries ← persistent user/project facts

Workflows, skills, and agents are loaded **on demand** — only when referenced in conversation.
