/**
 * Wrapper for `quasar dev -m capacitor -T ios` that ensures Xcode opens
 * App.xcworkspace instead of App.xcodeproj.
 *
 * Quasar's findXcodeWorkspace iterates the ios/App directory and returns
 * the first file ending in .xcworkspace OR .xcodeproj. Since .xcodeproj
 * sorts before .xcworkspace alphabetically, Xcode always opens the project
 * file — which lacks CocoaPods and fails to build with "No such module Capacitor".
 *
 * This script detects when Quasar has opened the IDE and immediately opens
 * the correct workspace, which macOS switches to in the existing Xcode window.
 */

import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = path.join(root, 'src-capacitor/ios/App/App.xcworkspace');

const dev = spawn('quasar', ['dev', '-m', 'capacitor', '-T', 'ios'], {
  cwd: root,
  stdio: ['inherit', 'pipe', 'inherit'],
  shell: true,
});

let opened = false;

dev.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write(text);

  if (!opened && text.includes('Opening XCode')) {
    opened = true;
    setTimeout(() => execSync(`open "${workspace}"`), 1500);
  }
});

process.on('SIGINT', () => {
  dev.kill('SIGINT');
  process.exit(0);
});

dev.on('exit', (code) => process.exit(code ?? 0));
