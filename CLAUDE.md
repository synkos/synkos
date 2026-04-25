# Synkos — Project Context for Claude

## What is this project?

Synkos is a **framework and scaffolding CLI** for building fullstack mobile/web apps with Vue + Quasar (frontend) and Node/Express (backend). The main deliverable is the `create-synkos` npm package: users run `pnpm create synkos` and get a ready-to-use project.

---

## Monorepo structure

```
synkos/
├── apps/
│   ├── frontend/       ← dev workspace for the frontend template (live, workspace deps)
│   └── backend/        ← dev workspace for the backend template (live, workspace deps)
├── packages/
│   ├── create-synkos/  ← the CLI published to npm (pnpm create synkos)
│   ├── synkos/         ← core runtime package
│   ├── synkos-ui/      ← UI component library
│   ├── synkos-server/  ← server utilities
│   ├── synkos-config/  ← shared config
│   └── synkos-utils/   ← shared utilities
├── templates/
│   ├── frontend/       ← source of truth for the frontend template (has {{VARS}})
│   └── backend/        ← source of truth for the backend template (has {{VARS}})
├── scripts/
│   └── sync-templates.mjs  ← syncs apps/ → templates/ (see below)
└── .changeset/         ← changesets for versioning packages/
```

---

## apps/ vs templates/ — the most important relationship

`apps/frontend` and `apps/backend` are **development workspaces**: they consume monorepo packages via `workspace:*`, use real package names, and are where new features are developed and tested with live reloading.

`templates/frontend` and `templates/backend` are **what the user receives** when they run `pnpm create synkos`. They contain template variables (`{{PROJECT_NAME}}`, `{{APP_NAME}}`, `{{BUNDLE_ID}}`) instead of real values, and no `workspace:*` deps.

`packages/create-synkos/templates/` is **generated at build time** (gitignored) by copying from `templates/` via `scripts/copy-templates.mjs` during the `prebuild` step.

```
apps/frontend  ──(pnpm sync:templates)──▶  templates/frontend  ──(prebuild)──▶  create-synkos npm package
     ↑                                                                                      ↓
  develop here                                                               pnpm create synkos (user)
```

### Template variables

| Variable           | Real value (apps/)     |
| ------------------ | ---------------------- |
| `{{PROJECT_NAME}}` | `frontend` / `backend` |
| `{{APP_NAME}}`     | `Synkos Dev`           |
| `{{BUNDLE_ID}}`    | `com.synkos.dev`       |

---

## Key commands

```bash
pnpm dev:frontend          # run apps/frontend in dev mode
pnpm dev:backend           # run apps/backend in dev mode
pnpm sync:templates        # sync apps/ → templates/ (run after feature work)
pnpm build                 # build all packages/
pnpm changeset             # create a new changeset
pnpm release               # build + publish packages with changesets
```

---

## Development workflow

1. **Develop** new features in `apps/frontend` or `apps/backend`
2. **Test** with live reloading and real workspace deps
3. **Run** `pnpm sync:templates` to propagate changes to `templates/`
4. **Commit** both `apps/` and `templates/` changes together
5. **Add changeset** if any `packages/` changed (see below)
6. **Push** following `.claude/workflows/push-git.yaml`

---

## Changesets — when to create one

Only for changes in `packages/` that users will notice:

| Situation                         | Changeset? | Bump  |
| --------------------------------- | ---------- | ----- |
| Fix bug in a package              | Yes        | patch |
| New feature / export in a package | Yes        | minor |
| Breaking API change               | Yes        | major |
| Change only in `apps/`            | No         | —     |
| Change only in `templates/`       | No         | —     |
| templates/ change visible to user | Yes (`create-synkos`) | patch |
| Docs / style / format             | No         | —     |

Use `.claude/workflows/push-git.yaml` for the full git flow.

---

## Workflows available

| Workflow                                | When to use                                            |
| --------------------------------------- | ------------------------------------------------------ |
| `.claude/workflows/push-git.yaml`       | Stage, commit, and push following monorepo conventions |
| `.claude/workflows/sync-templates.yaml` | Sync apps/ → templates/ and push the update            |
| `.claude/workflows/plan-task.yaml`      | Analyze a request and decide execution strategy        |
