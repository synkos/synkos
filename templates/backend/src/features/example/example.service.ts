import { Types } from 'mongoose';
import { Example } from './example.model';

export interface CreateExampleInput {
  title: string;
  content: string;
}

export interface ExampleDto {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(doc: Record<string, unknown>): ExampleDto {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    title: doc.title as string,
    content: doc.content as string,
    createdAt: doc.createdAt as Date,
    updatedAt: doc.updatedAt as Date,
  };
}

export const ExampleService = {
  async create(userId: string, input: CreateExampleInput): Promise<ExampleDto> {
    const doc = await Example.create({
      userId: new Types.ObjectId(userId),
      ...input,
    });
    return toDto(doc.toObject());
  },

  async findById(id: string, userId: string): Promise<ExampleDto> {
    const doc = await Example.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    }).lean();

    if (!doc) {
      const err = Object.assign(new Error('Example not found'), { status: 404, code: 'NOT_FOUND' });
      throw err;
    }

    return toDto(doc as Record<string, unknown>);
  },

  async list(userId: string): Promise<ExampleDto[]> {
    const docs = await Example.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((d) => toDto(d as Record<string, unknown>));
  },

  async delete(id: string, userId: string): Promise<void> {
    const result = await Example.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      const err = Object.assign(new Error('Example not found'), { status: 404, code: 'NOT_FOUND' });
      throw err;
    }
  },
};
