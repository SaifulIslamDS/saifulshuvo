import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Saiful Islam for remote opportunities and project collaboration.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="inner-page">
        <section className="page-hero section-shell">
          <div className="container contact-grid">
            <div>
              <SectionHeading
                eyebrow="Contact"
                title="Let’s discuss a role, project or useful idea"
                description="I am interested in remote data roles, analytics projects, web applications and practical AI-assisted product work."
              />
              <div className="contact-details">
                <a href="mailto:your-email@example.com"><span className="icon-box"><Icon name="mail" /></span><div><small>Email placeholder</small><strong>your-email@example.com</strong></div></a>
                <a href="https://www.linkedin.com/in/saifulislampro" target="_blank" rel="noreferrer"><span className="icon-box"><Icon name="linkedin" /></span><div><small>LinkedIn</small><strong>linkedin.com/in/saifulislampro</strong></div></a>
                <div><span className="icon-box"><Icon name="map" /></span><div><small>Location</small><strong>Bangladesh · Remote worldwide</strong></div></div>
              </div>
            </div>
            <form className="contact-form">
              <div className="form-row"><label>Full name<input type="text" placeholder="Your name" /></label><label>Email address<input type="email" placeholder="you@company.com" /></label></div>
              <label>What would you like to discuss?<select defaultValue=""><option value="" disabled>Select an option</option><option>Remote job opportunity</option><option>Data analytics project</option><option>Web or application project</option><option>AI-assisted workflow</option><option>Other collaboration</option></select></label>
              <label>Message<textarea rows={6} placeholder="Tell me about the opportunity or project..." /></label>
              <button className="button button-primary" type="button">Send message <Icon name="arrow" size={18} /></button>
              <p className="form-note">UI preview only — form submission will be connected during the backend phase.</p>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
