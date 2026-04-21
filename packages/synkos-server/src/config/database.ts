import mongoose from "mongoose";
import { env } from "@/config/env";
import { createLogger } from "@/utils/logger";

const log = createLogger("database");

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    log.info("MongoDB connected");
  } catch (error) {
    log.error({ err: error }, "MongoDB connection failed");
    throw error;
  }
}

mongoose.connection.on("disconnected", () => {
  log.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  log.error({ err }, "MongoDB error");
});
