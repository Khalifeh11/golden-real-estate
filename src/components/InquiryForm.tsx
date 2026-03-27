"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryFormState } from "@/lib/actions";

interface InquiryFormProps {
  propertySlug: string;
  propertyTitle: string;
}

const initialState: InquiryFormState = {
  success: false,
  message: "",
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-error text-xs mt-1">{errors[0]}</p>;
}

export default function InquiryForm({ propertySlug, propertyTitle }: InquiryFormProps) {
  const [state, formAction, isPending] = useActionState(submitInquiry, initialState);

  if (state.success) {
    return (
      <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
        <div className="flex items-center gap-3 text-tertiary">
          <span
            className="material-symbols-outlined text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <div>
            <h3 className="font-display font-bold text-lg">Inquiry Sent</h3>
            <p className="text-on-surface-variant text-sm mt-1">{state.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const inputClasses =
    "w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/20 focus:border-primary-container focus:ring-0 px-0 py-2 transition-all text-on-surface placeholder:text-outline";

  return (
    <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
      <h3 className="font-display font-bold text-xl mb-6">Inquire About Property</h3>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="propertySlug" value={propertySlug} />
        <input type="hidden" name="subject" value={`Inquiry about ${propertyTitle}`} />

        <div>
          <label className="block text-xs uppercase tracking-widest text-outline mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            required
            className={inputClasses}
          />
          <FieldError errors={state.errors?.name} />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-outline mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="john@example.com"
            required
            className={inputClasses}
          />
          <FieldError errors={state.errors?.email} />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-outline mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="+961 -- --- ---"
            className={inputClasses}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-outline mb-1">
            Message
          </label>
          <textarea
            name="message"
            placeholder="I am interested in this property..."
            rows={3}
            required
            className={inputClasses}
          />
          <FieldError errors={state.errors?.message} />
        </div>

        {state.message && !state.success && (
          <p className="text-error text-sm">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary-container text-on-primary-container py-4 rounded-lg font-display font-bold text-lg shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          {isPending ? "Submitting..." : "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
}
