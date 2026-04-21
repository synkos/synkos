import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

/**
 * Start an in-memory MongoDB instance and connect Mongoose to it.
 * Call once in beforeAll. Does not use connectDatabase() from core
 * so env.MONGODB_URI (the test placeholder) is never needed.
 */
export async function connectTestDb(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

/**
 * Disconnect Mongoose and stop the in-memory server.
 * Call in afterAll.
 */
export async function disconnectTestDb(): Promise<void> {
  await mongoose.disconnect();
  await mongod?.stop();
}

/**
 * Delete all documents from every collection.
 * Call in beforeEach to guarantee test isolation without restarting the server.
 */
export async function clearDb(): Promise<void> {
  const cols = mongoose.connection.collections;
  await Promise.all(Object.values(cols).map((c) => c.deleteMany({})));
}
