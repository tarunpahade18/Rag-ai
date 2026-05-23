import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  vaultId: mongoose.Types.ObjectId;
  folderId: string;
  name: string;
  type: string;
  size: string;
  chunkCount: number;
  status: "pending" | "indexing" | "ready" | "failed";
  fileUrl?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vaultId: { type: Schema.Types.ObjectId, ref: "Vault", required: true, index: true },
    folderId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: String, required: true },
    chunkCount: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "indexing", "ready", "failed"], default: "pending" },
    fileUrl: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

DocumentSchema.index({ userId: 1, vaultId: 1 });
DocumentSchema.index({ userId: 1, folderId: 1 });

export const DocumentModel = mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);