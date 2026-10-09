"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

const LABEL = "label text-ink/75";
const FIELD =
  "mt-2 w-full border-0 border-b border-ink/30 bg-transparent px-0 py-3 font-sans text-base text-ink transition-colors placeholder:text-ink/40 hover:border-ink/60 focus:border-ink focus:outline-none focus-visible:outline-none focus-visible:shadow-[0_1px_0_0_var(--color-ink)]";

export default function EnquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !message) {
      setStatus("error");
      setErrorMessage("Please fill in your name and message.");
      return;
    }

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          message,
          website: String(formData.get("website") ?? ""),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Something went wrong." }));
        setStatus("error");
        setErrorMessage(body.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      form.reset();
      // No form contents are sent to analytics — only that a message went through.
      trackEvent(ANALYTICS_EVENTS.contactFormSubmit, { form_location: "contact_page" });
    } catch {
      setStatus("error");
      setErrorMessage("Network error — please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="border-t border-ink pt-8">
        <p className="font-display text-3xl">Thank you!</p>
        <p className="mt-3 font-sans text-ink/75">
          Your message has been sent — we&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-8" noValidate>
      {/* Honeypot — real visitors never see or reach this field */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className={LABEL}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="email" className={LABEL}>
          Email (optional)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="phone" className={LABEL}>
          Phone (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="message" className={LABEL}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={FIELD}
        />
      </div>

      {status === "error" && errorMessage && (
        <p role="alert" className="border-l-2 border-red-700 pl-4 font-sans text-sm text-red-800">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className={buttonClasses("ink", "lg", "w-full sm:w-fit disabled:opacity-50")}
      >
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>

      <p className="-mt-4 font-sans text-xs leading-relaxed text-ink/65">
        We only use your details to reply to you. See our{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
          Privacy Notice
        </Link>
        .
      </p>
    </form>
  );
}
