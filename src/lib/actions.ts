"use server";

import { headers } from "next/headers";
import dbConnect from "./mongodb";
import ContactRequestModel from "@/models/ContactRequest";
import { contactFormSchema } from "./validators";
import { sendInquiryNotification } from "./email";

export type InquiryFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const SUCCESS_MESSAGE =
  "Your inquiry has been submitted successfully. We will get back to you shortly.";

export async function submitInquiry(
  _prevState: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  // Honeypot: real users never fill this hidden field.
  // Fake success so bots don't learn they were rejected.
  if (formData.get("website")) {
    return { success: true, message: SUCCESS_MESSAGE };
  }

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

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    null;

  await dbConnect();

  if (ip) {
    const recent = await ContactRequestModel.countDocuments({
      ipAddress: ip,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    });
    if (recent >= 5) {
      return {
        success: false,
        message: "Too many submissions. Please try again later.",
      };
    }
  }

  await ContactRequestModel.create({
    _id: crypto.randomUUID(),
    name: result.data.name,
    email: result.data.email,
    phone: result.data.phone,
    message: result.data.message,
    propertySlug: result.data.propertySlug,
    subject: result.data.subject,
    ipAddress: ip ?? undefined,
  });

  // Fire-and-forget — don't block the user response on email delivery
  sendInquiryNotification({
    name: result.data.name,
    email: result.data.email,
    phone: result.data.phone,
    message: result.data.message,
    subject: result.data.subject,
    propertySlug: result.data.propertySlug,
  }).catch(() => {});

  return { success: true, message: SUCCESS_MESSAGE };
}
