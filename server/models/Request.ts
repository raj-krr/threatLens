import mongoose, { Document, Schema } from "mongoose";

export interface IRequest extends Document {
  projectId: string;
  ip: string;
  endpoint: string;
  method: string;
  userAgent: string;
  body: string;
  threatScore: number;
  status: "allowed" | "flagged" | "blocked";
  attackType: string;
  timestamp: Date;
}

const RequestSchema = new Schema<IRequest>({
  projectId:   { type: String, required: true },
  ip:          { type: String, required: true },
  endpoint:    { type: String, required: true },
  method:      { type: String },
  userAgent:   { type: String },
  body:        { type: String },
  threatScore: { type: Number, default: 0 },
  status:      { type: String, enum: ["allowed", "flagged", "blocked"] },
  attackType:  { type: String, default: "normal" },
  timestamp:   { type: Date, default: Date.now }
});

export default mongoose.model<IRequest>("Request", RequestSchema);