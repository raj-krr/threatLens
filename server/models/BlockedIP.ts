import mongoose, { Document, Schema } from "mongoose";

export interface IBlockedIP extends Document {
  projectId: string;
  ip: string;
  reason: string;
  blockedAt: Date;
  expiresAt: Date;
}

const BlockedIPSchema = new Schema<IBlockedIP>({
  projectId: { type: String, required: true },
  ip:        { type: String, required: true },
  reason:    { type: String },
  blockedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

export default mongoose.model<IBlockedIP>("BlockedIP", BlockedIPSchema);