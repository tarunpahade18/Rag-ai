import mongoose, { Schema, Document } from "mongoose";

export interface IFolder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  vaultId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vaultId: { type: Schema.Types.ObjectId, ref: "Vault", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

FolderSchema.index({ userId: 1, vaultId: 1 });

export const Folder = mongoose.models.Folder || mongoose.model<IFolder>("Folder", FolderSchema);