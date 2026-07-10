"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

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
    } catch {
      setStatus("error");
      setErrorMessage("Network error — please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="font-sans text-ink">
        Thank you! Your message has been sent — we&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Honeypot — real visitors never see or reach this field */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="font-sans text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 w-full border border-taupe/40 bg-cream px-4 py-2 font-sans focus-visible:border-gold"
        />
      </div>

      <div>
        <label htmlFor="email" className="font-sans text-sm font-medium">
          Email (optional)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="mt-1 w-full border border-taupe/40 bg-cream px-4 py-2 font-sans focus-visible:border-gold"
        />
      </div>

      <div>
        <label htmlFor="phone" className="font-sans text-sm font-medium">
          Phone (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="mt-1 w-full border border-taupe/40 bg-cream px-4 py-2 font-sans focus-visible:border-gold"
        />
      </div>

      <div>
        <label htmlFor="message" className="font-sans text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-1 w-full border border-taupe/40 bg-cream px-4 py-2 font-sans focus-visible:border-gold"
        />
      </div>

      {status === "error" && errorMessage && (
        <p role="alert" className="font-sans text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 inline-flex w-fit items-center rounded-full bg-ink px-6 py-2.5 font-sans text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
