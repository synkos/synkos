import { type Request, type Response } from "express";
import { z } from "zod";
import { getRequestContext } from "@synkos/server/context";
import { ExampleService }    from "./example.service";

const createSchema = z.object({
  title:   z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
});

export const ExampleController = {
  async create(req: Request, res: Response): Promise<void> {
    const { userId } = getRequestContext();
    const body = createSchema.parse(req.body);

    const example = await ExampleService.create(userId, body);
    res.status(201).json({ success: true, data: example });
  },

  async list(req: Request, res: Response): Promise<void> {
    const { userId } = getRequestContext();

    const examples = await ExampleService.list(userId);
    res.json({ success: true, data: examples });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { userId } = getRequestContext();
    const { id }     = z.object({ id: z.string().length(24) }).parse(req.params);

    const example = await ExampleService.findById(id, userId);
    res.json({ success: true, data: example });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const { userId } = getRequestContext();
    const { id }     = z.object({ id: z.string().length(24) }).parse(req.params);

    await ExampleService.delete(id, userId);
    res.json({ success: true });
  },
};
