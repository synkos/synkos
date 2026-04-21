import type { ModuleDefinition } from "@/types/module.types";
import router from "./auth.routes";

export const authModule: ModuleDefinition = {
  path: "/auth",
  router,
  auth: "mixed", // public endpoints (register, login) + protected (/me, /logout)
};

export { userSchema } from "./user.schema";
export type { IUser, AuthProvider, DeletionStatus } from "./user.schema";
