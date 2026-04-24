import { spawn } from 'child_process';
import { mkdirSync, writeFileSync, chmodSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Quasar's open-ide.js has a bug: it opens App.xcodeproj instead of
// App.xcworkspace because readdirSync returns xcodeproj first alphabetically.
// The `open` npm package resolves the `open` command via PATH, so we inject
// a temporary wrapper that redirects any .xcodeproj → .xcworkspace call.
const tmpDir = join(tmpdir(), `synkos-ios-${process.pid}`);
mkdirSync(tmpDir, { recursive: true });

writeFileSync(
  join(tmpDir, 'open'),
  `#!/bin/bash
for arg in "$@"; do
  if [[ "$arg" == *.xcodeproj ]]; then
    workspace="\${arg%.xcodeproj}.xcworkspace"
    exec /usr/bin/open "$workspace"
  fi
done
exec /usr/bin/open "$@"
`,
);
chmodSync(join(tmpDir, 'open'), 0o755);

const child = spawn('quasar', ['dev', '-m', 'capacitor', '-T', 'ios'], {
  env: { ...process.env, PATH: `${tmpDir}:${process.env.PATH}` },
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  try {
    rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
};

child.on('exit', (code) => {
  cleanup();
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});
