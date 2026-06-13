import mongoose, { Schema, Document } from "mongoose";

export interface IVault extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VaultSchema = new Schema<IVault>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

VaultSchema.index({ userId: 1 });

export const Vault = mongoose.models.Vault || mongoose.model<IVault>("Vault", VaultSchema);