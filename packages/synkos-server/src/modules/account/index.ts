import type { ModuleDefinition } from "@/types/module.types";
import router from "./account.routes";

export const accountModule: ModuleDefinition = {
  path: "/account",
  router,
  auth: "required",
};

export { AccountService, registerDeletionCleanup } from "./account.service";
