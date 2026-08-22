import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "How the Saiful Islam portfolio handles contact messages, essential storage and optional analytics measurements.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader/>
      <main id="main-content" className="inner-page privacy-page">
        <section className="page-hero section-shell"><div className="container"><span className="eyebrow">Privacy notice</span><h1>Clear, limited and purpose-driven data use</h1><p>This notice describes the technical behaviour of this personal portfolio. It is an operational summary, not a substitute for jurisdiction-specific legal advice.</p></div></section>
        <section className="section-shell compact-top"><div className="container privacy-content">
          <article><h2>Contact messages</h2><p>When you submit the contact form, the site stores your name, email address, optional organisation, selected topic, subject and message so the site owner can review and respond. The inbox also stores workflow information such as read, replied, archived or spam status.</p></article>
          <article><h2>Abuse prevention</h2><p>The contact form derives a one-way request fingerprint for rate limiting. Raw IP addresses are not stored in the contact record. Duplicate and excessive submissions may be rejected.</p></article>
          <article><h2>Analytics choices</h2><p>When analytics consent is required, optional page-view, performance and client-error measurements run only after you choose “Allow analytics.” Choosing “Necessary only” prevents those requests. The site can also respect the browser Do Not Track signal.</p></article>
          <article><h2>First-party telemetry</h2><p>Anonymous telemetry can include the visited path, a random browser-session identifier, Core Web Vitals and bounded browser error details stored by the WordPress backend. It does not intentionally include contact-form content, email addresses or authenticated administrator data.</p></article>
          <article><h2>Third-party analytics</h2><p>The site owner may optionally configure Google Analytics 4 or Plausible Analytics. Their scripts load only when the configured privacy conditions allow them. Those providers process data under their own terms and policies.</p></article>
          <article><h2>Retention and deletion</h2><p>Anonymous telemetry is retained for the period configured in the WordPress CMS and can be purged by the administrator. Contact messages can be archived, marked as spam and permanently deleted through the protected WordPress inbox.</p></article>
          <article><h2>Your browser controls</h2><p>Use the “Analytics choices” control in the site footer to reopen the consent prompt. You may also clear this site’s local storage or use browser tracking protection and Do Not Track where supported.</p></article>
          <article><h2>Questions</h2><p>Questions about this portfolio’s data handling can be sent through the <Link href="/contact">contact page</Link>.</p></article>
          <p className="privacy-updated">Last updated: 22 August 2026</p>
        </div></section>
      </main>
      <SiteFooter/>
    </>
  );
}
