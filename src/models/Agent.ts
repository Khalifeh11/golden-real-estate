import mongoose, { Schema, Document } from "mongoose";

export interface IAgent extends Document<string> {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  bio?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    _id: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: String,
    phone: String,
    bio: String,
    photoUrl: String,
  },
  { timestamps: true }
);

export default mongoose.models.Agent ||
  mongoose.model<IAgent>("Agent", AgentSchema);
