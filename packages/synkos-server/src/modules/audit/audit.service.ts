import { createLogger } from '@/utils/logger';
import { AuditLog, type AuditEventType } from './audit-log.model';

const log = createLogger('audit');

export interface AuditEvent {
  userId: string;
  type: AuditEventType;
  oldValue?: string;
  newValue?: string;
}

/**
 * Fire-and-forget audit logging.
 * Never throws — a failed log must never break the caller's operation.
 */
export function logAuditEvent(event: AuditEvent): void {
  AuditLog.create({
    userId: event.userId,
    type: event.type,
    oldValue: event.oldValue,
    newValue: event.newValue,
  }).catch((err) => {
    log.error({ err, event }, 'Failed to write audit log');
  });
}
