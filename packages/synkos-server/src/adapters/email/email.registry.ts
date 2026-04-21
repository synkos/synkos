import { ConsoleEmailAdapter } from "./console.email-adapter";
import type { EmailPort } from "@/ports/email.port";

/**
 * Module-level singleton. Starts with the console adapter so the app is safe
 * to boot with no email configuration — nothing crashes, emails are logged.
 *
 * Projects call setEmailAdapter() in bootstrap/adapters.ts (imported before
 * any module that could trigger email sends).
 */
let adapter: EmailPort = new ConsoleEmailAdapter();

export function setEmailAdapter(impl: EmailPort): void {
  adapter = impl;
}

export function getEmailAdapter(): EmailPort {
  return adapter;
}
