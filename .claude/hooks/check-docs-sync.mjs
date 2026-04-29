#!/usr/bin/env node
// PostToolUse hook — prints a reminder to run `pnpm sync:docs` when a file
// that drives the auto-generated apps/web docs is edited.
//
// Receives a JSON payload on stdin with the shape Claude Code emits:
//   { tool_name: 'Edit'|'Write'|..., tool_input: { file_path: '...' } }
//
// Output goes to stderr so it doesn't pollute the assistant's transcript;
// the user sees it inline in the Claude Code console.

import process, { stdin } from 'node:process'

const TRIGGERS = [
  // Exported Vue components
  /packages\/synkos-ui\/src\/components\/.+\.vue$/,
  /packages\/synkos-client\/src\/(vue\/components|navigation\/layouts|vue\/SynkosApp\.vue$)/,
  // Public API entry points
  /packages\/synkos-(ui|client)\/src\/index\.ts$/,
]

let raw = ''
stdin.setEncoding('utf8')
stdin.on('data', (c) => (raw += c))
stdin.on('end', () => {
  try {
    const payload = JSON.parse(raw || '{}')
    const file = payload.tool_input?.file_path ?? ''
    if (!file) return

    const matched = TRIGGERS.some((re) => re.test(file))
    if (!matched) return

    const home = process.env.HOME ?? ''
    const display = home ? file.replace(home, '~') : file
    process.stderr.write(
      `\n\x1b[33m[sync:docs reminder]\x1b[0m ${display} was edited.\n` +
        `  Run \x1b[1mpnpm sync:docs\x1b[0m before commit so apps/web docs stay in sync.\n` +
        `  See \x1b[36m.claude/workflows/sync-docs.yaml\x1b[0m for the full flow.\n\n`,
    )
  } catch {
    // Stay silent on malformed input; the hook is informational, not load-bearing.
  }
})
