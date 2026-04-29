import mongoose, { type Schema, type Model } from 'mongoose';

/**
 * Returns a Mongoose model registered under `name`, reusing the existing one
 * if it has already been compiled in this process. Multiple bundles of the
 * same package (subpath imports) and hot-reload re-evaluations both rely on
 * `mongoose.models` being a singleton, so this is safe across all entries.
 */
export function defineModel<T>(name: string, schema: Schema<T>, collection?: string): Model<T> {
  const existing = mongoose.models[name] as Model<T> | undefined;
  if (existing) return existing;
  return mongoose.model<T>(name, schema, collection);
}
