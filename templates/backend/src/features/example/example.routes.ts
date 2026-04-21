import { Router }            from "express";
import { authenticate }      from "@synkos/server/middleware";
import { ExampleController } from "./example.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(  "/",    ExampleController.create);
router.get(   "/",    ExampleController.list);
router.get(   "/:id", ExampleController.getById);
router.delete("/:id", ExampleController.delete);

export { router };
