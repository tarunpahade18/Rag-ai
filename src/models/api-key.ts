import mongoose, { Schema, Document } from "mongoose";

export interface IApiKey extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  keyHash: string;
  prefix: string;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, default: "ChatGPT Plugin" },
    keyHash: { type: String, required: true, unique: true },
    prefix: { type: String, required: true },
    lastUsedAt: { type: Date },
  },
  { timestamps: true }
);

ApiKeySchema.index({ userId: 1, createdAt: -1 });

export const ApiKey =
  mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema);
