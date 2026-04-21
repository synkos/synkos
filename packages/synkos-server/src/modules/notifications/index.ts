import { ModuleDefinition } from "@/types/module.types";
import router from "./notifications.routes";

export const notificationsModule: ModuleDefinition = {
  path: "/admin/notifications",
  router,
  auth: "required",
  adminOnly: true,
};
