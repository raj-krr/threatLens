import mongoose, { Document, Schema, CallbackWithoutResultAndOptionalError } from "mongoose";
import crypto from "crypto";

export interface IProject extends Document {
  ownerEmail: string;
  projectId: string;
  apiKey: string;
  websiteName: string;
   domain: string;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  ownerEmail:  { type: String, required: true },
  projectId:   { type: String, unique: true },
  apiKey:      { type: String, unique: true },
  websiteName: { type: String },
  domain:      { type: String, required: true },
  createdAt:   { type: Date, default: Date.now }
});



export default mongoose.model<IProject>("Project", ProjectSchema);