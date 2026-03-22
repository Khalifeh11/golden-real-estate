import mongoose, { Schema, Document } from "mongoose";

export interface IContactRequest extends Document {
  _id: string;
  subject?: string;
  propertySlug?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  isRead: boolean;
  isResponded: boolean;
  createdAt: Date;
}

const ContactRequestSchema = new Schema<IContactRequest>({
  _id: { type: String, required: true },
  subject: String,
  propertySlug: String,
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  message: String,
  isRead: { type: Boolean, default: false },
  isResponded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ContactRequest ||
  mongoose.model<IContactRequest>("ContactRequest", ContactRequestSchema);
