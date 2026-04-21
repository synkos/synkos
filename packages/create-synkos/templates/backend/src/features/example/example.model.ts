import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IExample extends Document {
  userId:    Types.ObjectId;
  title:     string;
  content:   string;
  createdAt: Date;
  updatedAt: Date;
}

const exampleSchema = new Schema<IExample>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title:   { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: true },
);

export const Example = mongoose.model<IExample>("Example", exampleSchema);
