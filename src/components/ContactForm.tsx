"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { postWordPressRest } from "@/lib/wordpress/rest";
import type { ContactFormState } from "@/types/contact";

const initialState: ContactFormState = { status: "idle", message: "" };

function FieldError({ message }: { message?: string }) {
  return message ? <small className="field-error">{message}</small> : null;
}

function value(formData: FormData, key: string): string {
  const candidate = formData.get(key);
  return typeof candidate === "string" ? candidate.trim() : "";
}

function validate(formData: FormData): { state?: ContactFormState; payload: Record<string, string | number> } {
  const fullName = value(formData, "full_name");
  const email = value(formData, "email").toLowerCase();
  const company = value(formData, "company");
  const subject = value(formData, "subject");
  const interest = value(formData, "interest");
  const message = value(formData, "message");
  const sourcePage = value(formData, "source_page") || "/contact";
  const website = value(formData, "website");
  const startedAt = Number(value(formData, "started_at"));

  const fieldErrors: ContactFormState["fieldErrors"] = {};
  if (fullName.length < 2 || fullName.length > 120) fieldErrors.fullName = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fieldErrors.email = "Enter a valid email address.";
  if (subject.length < 3 || subject.length > 180) fieldErrors.subject = "Add a short, useful subject.";
  if (!interest) fieldErrors.interest = "Select what you would like to discuss.";
  if (message.length < 20 || message.length > 5000) fieldErrors.message = "Write a message between 20 and 5000 characters.";

  const payload = {
    full_name: fullName,
    email,
    company,
    subject,
    interest,
    message,
    source_page: sourcePage,
    website,
    started_at: Number.isFinite(startedAt) ? startedAt : Date.now(),
  };

  if (website || company.length > 160) {
    return { payload, state: { status: "error", message: "Unable to accept this submission." } };
  }
  if (Number.isFinite(startedAt) && Date.now() - startedAt < 1_500) {
    return { payload, state: { status: "error", message: "Please take a moment to review your message and try again." } };
  }
  if (Object.keys(fieldErrors).length) {
    return { payload, state: { status: "error", message: "Please review the highlighted fields.", fieldErrors } };
  }
  return { payload };
}

export function ContactForm() {
  const [state, setState] = useState<ContactFormState>(initialState);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const startedAtRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    const validation = validate(formData);
    if (validation.state) {
      setState(validation.state);
      return;
    }

    setPending(true);
    setState({ status: "idle", message: "" });
    try {
      const result = await postWordPressRest<{ ok?: boolean; message?: string }>("/contact", validation.payload);
      setState({
        status: "success",
        message: result.message || "Thank you. Your message has been received and saved securely.",
      });
      formRef.current?.reset();
      if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Your message could not be submitted. Please try again or contact me by email.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="contact-form">
      <input type="hidden" name="source_page" value="/contact" />
      <input ref={startedAtRef} type="hidden" name="started_at" defaultValue="" />
      <label className="contact-honeypot" aria-hidden="true">
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="form-row">
        <label>
          Full name
          <input name="full_name" type="text" placeholder="Your name" autoComplete="name" maxLength={120} required />
          <FieldError message={state.fieldErrors?.fullName} />
        </label>
        <label>
          Email address
          <input name="email" type="email" placeholder="you@company.com" autoComplete="email" maxLength={254} required />
          <FieldError message={state.fieldErrors?.email} />
        </label>
      </div>

      <div className="form-row">
        <label>
          Company or organisation <span className="optional-label">Optional</span>
          <input name="company" type="text" placeholder="Company name" autoComplete="organization" maxLength={160} />
        </label>
        <label>
          Discussion topic
          <select name="interest" defaultValue="" required>
            <option value="" disabled>Select an option</option>
            <option value="Remote data or BI role">Remote data or BI role</option>
            <option value="Web development opportunity">Web development opportunity</option>
            <option value="Data analytics project">Data analytics project</option>
            <option value="SaaS or business application">SaaS or business application</option>
            <option value="WordPress project">WordPress project</option>
            <option value="AI-assisted workflow">AI-assisted workflow</option>
            <option value="Other collaboration">Other collaboration</option>
          </select>
          <FieldError message={state.fieldErrors?.interest} />
        </label>
      </div>

      <label>
        Subject
        <input name="subject" type="text" placeholder="A short summary of your message" maxLength={180} required />
        <FieldError message={state.fieldErrors?.subject} />
      </label>

      <label>
        Message
        <textarea name="message" rows={7} placeholder="Tell me about the role, team, project or business problem..." minLength={20} maxLength={5000} required />
        <FieldError message={state.fieldErrors?.message} />
      </label>

      {state.status !== "idle" ? (
        <div className={`contact-form-status contact-form-${state.status}`} role={state.status === "error" ? "alert" : "status"}>
          <Icon name={state.status === "success" ? "check" : "close"} size={18} />
          <span>{state.message}</span>
        </div>
      ) : null}

      <button className="button button-primary" type="submit" disabled={pending} aria-disabled={pending}>
        {pending ? "Sending…" : <>Send message <Icon name="arrow" size={18} /></>}
      </button>
      <p className="form-note">Your message is stored in the private WordPress contact inbox. No raw IP address is retained. See the <Link href="/privacy">privacy notice</Link>.</p>
    </form>
  );
}
