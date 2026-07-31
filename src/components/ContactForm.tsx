"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitContactAction } from "@/app/contact/actions";
import { Icon } from "@/components/Icon";
import type { ContactFormState } from "@/types/contact";

const initialState: ContactFormState = { status: "idle", message: "" };

function ContactSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button button-primary" type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Sending…" : <>Send message <Icon name="arrow" size={18} /></>}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <small className="field-error">{message}</small> : null;
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactAction, initialState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const startedAtRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (startedAtRef.current && !startedAtRef.current.value) {
      startedAtRef.current.value = String(Date.now());
    }
    if (state.status === "success") {
      formRef.current?.reset();
      if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="contact-form">
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

      <ContactSubmitButton />
      <p className="form-note">Your message is stored securely in the private portfolio inbox. No raw IP address is retained.</p>
    </form>
  );
}
