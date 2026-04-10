import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "info@goldenlandrealestate.net";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "Golden Land <noreply@goldenlandrealestate.net>";

interface InquiryEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
  propertySlug?: string;
}

export async function sendInquiryNotification(data: InquiryEmailData) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping email notification");
    return;
  }

  const propertyLine = data.propertySlug
    ? `Property: ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenlandrealestate.net"}/properties/${data.propertySlug}`
    : null;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    replyTo: data.email,
    to: ADMIN_EMAIL,
    subject: data.subject ?? `New inquiry from ${data.name}`,
    text: [
      `New contact form submission`,
      ``,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.phone ? `Phone: ${data.phone}` : null,
      propertyLine,
      ``,
      `Message:`,
      data.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (error) {
    console.error("[email] Failed to send inquiry notification:", error);
  }
}
