# create-synkos

CLI scaffolder for the Synkos framework ecosystem.

## Usage

```bash
# pnpm (recommended)
pnpm create synkos

# npm
npm create synkos@latest

# npx
npx create-synkos
```

You can also pass the project name directly:

```bash
pnpm create synkos my-app
```

## What it asks

1. **Project name** — kebab-case identifier (`my-app`)
2. **Template** — `fullstack`, `frontend`, or `backend`
3. **App display name** — shown in the UI and native splash (`My App`)
4. **Bundle ID** — iOS/Android identifier (`com.company.myapp`)
5. **API port** — backend port (default `3001`)
6. **Package manager** — detected automatically, overridable
7. **Initialize git** — runs `git init && git add -A && git commit`
8. **Install dependencies** — runs `pnpm install` (or your chosen manager)

## Templates

| Template | Generates |
|---|---|
| `fullstack` | `frontend/` + `backend/` + root `package.json` |
| `frontend` | Quasar 2 + Vue 3 + Capacitor 8 app |
| `backend` | Express 5 + Mongoose 9 + @synkos/server API |

## Template variables

The CLI replaces these placeholders in template files:

| Variable | Example |
|---|---|
| `{{PROJECT_NAME}}` | `my-app` |
| `{{APP_NAME}}` | `My App` |
| `{{BUNDLE_ID}}` | `com.company.myapp` |
| `{{API_PORT}}` | `3001` |
| `{{PROJECT_DESCRIPTION}}` | `My App — built with Synkos` |

## After scaffolding

```bash
cd my-app

# Backend
cd backend && pnpm dev

# Frontend
cd frontend && quasar dev
```
