import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  vaultId: mongoose.Types.ObjectId;
  folderId: string;
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: {
      id: string;
      chunkIndex: number;
      score: number;
      sourceName: string;
      sourceType: string;
      text: string;
      pageNumber?: number;
      totalPages?: number;
      paragraphNumber?: number;
    }[];
    createdAt: Date;
  }[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vaultId: { type: Schema.Types.ObjectId, ref: "Vault", required: true, index: true },
    folderId: { type: String, required: true },
    messages: [
      {
        id: { type: String, required: true },
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        sources: [
          {
            id: String,
            chunkIndex: Number,
            score: Number,
            sourceName: String,
            sourceType: String,
            text: String,
            pageNumber: Number,
            totalPages: Number,
            paragraphNumber: Number,
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    title: { type: String, default: "New Chat" },
  },
  { timestamps: true }
);

ChatSchema.index({ userId: 1, vaultId: 1 });
ChatSchema.index({ userId: 1, createdAt: -1 });

export const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);