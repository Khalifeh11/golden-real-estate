"use server";

import dbConnect from "./mongodb";
import ContactRequestModel from "@/models/ContactRequest";
import { contactFormSchema } from "./validators";

export type InquiryFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitInquiry(
  _prevState: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message"),
    propertySlug: formData.get("propertySlug") || undefined,
    subject: formData.get("subject") || undefined,
  };

  const result = contactFormSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await dbConnect();

  await ContactRequestModel.create({
    _id: crypto.randomUUID(),
    name: result.data.name,
    email: result.data.email,
    phone: result.data.phone,
    message: result.data.message,
    propertySlug: result.data.propertySlug,
    subject: result.data.subject,
  });

  return { success: true, message: "Your inquiry has been submitted successfully. We will get back to you shortly." };
}
