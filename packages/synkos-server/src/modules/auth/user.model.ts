import mongoose from 'mongoose';
import { userSchema, type IUser } from './user.schema';

// Re-export all types so existing imports from "user.model" continue to work
export type { IUser, IAuthProvider, AuthProvider, DeletionStatus } from './user.schema';

/**
 * User model with deferred compilation.
 *
 * The model is NOT compiled at import time. It is compiled on the first
 * property access (e.g. User.findById, User.create). By that time, all
 * module-level imports — including bootstrap/extensions.ts — have already
 * been evaluated, so schema.add() calls are guaranteed to be applied.
 *
 * This eliminates the ordering constraint: any entry point (server, worker,
 * tests) can import User without worrying about import order.
 *
 * All existing code that uses User.findById(), User.find(), User.create(),
 * new User(), etc. continues to work without changes.
 */

let _User: mongoose.Model<IUser> | null = null;

function getUser(): mongoose.Model<IUser> {
  if (!_User) {
    // Try to retrieve an already-compiled model first.
    // This handles hot-reload (tsx watch) where the module may be re-evaluated
    // but mongoose.model() would throw "Cannot overwrite model once compiled".
    try {
      _User = mongoose.model<IUser>('User');
    } catch {
      _User = mongoose.model<IUser>('User', userSchema);
    }
  }
  return _User;
}

export const User = new Proxy<mongoose.Model<IUser>>({} as mongoose.Model<IUser>, {
  get(_target, prop: string | symbol) {
    const model = getUser();
    const value = (model as unknown as Record<string | symbol, unknown>)[prop];
    // Bind methods to preserve the correct `this` context
    return typeof value === 'function'
      ? (value as (...a: unknown[]) => unknown).bind(model)
      : value;
  },
  construct(_target, args) {
    const model = getUser();
    return new (model as unknown as new (...a: unknown[]) => unknown)(...args) as object;
  },
});
