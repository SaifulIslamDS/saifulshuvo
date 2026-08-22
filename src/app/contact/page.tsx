import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getHomepageContent } from "@/lib/wordpress/queries/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Saiful Islam for remote data, analytics, development and product opportunities.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const profile = await getHomepageContent();
  const linkedin = profile.socialLinks.linkedin || "https://www.linkedin.com/in/saifulislampro";
  const github = profile.socialLinks.github || "https://github.com/SaifulIslamDS";
  return <><SiteHeader/><main id="main-content" className="inner-page"><section className="page-hero section-shell"><div className="container contact-grid"><div><SectionHeading eyebrow="Contact" title="Let’s discuss a role, project or useful idea" description="I am open to international remote roles, analytics and BI projects, web applications, WordPress work and practical AI-assisted product initiatives."/><div className="contact-details"><a href={`mailto:${profile.contactEmail}`}><span className="icon-box"><Icon name="mail" /></span><div><small>Email</small><strong>{profile.contactEmail}</strong></div></a><a href={linkedin} target="_blank" rel="noreferrer"><span className="icon-box"><Icon name="linkedin" /></span><div><small>LinkedIn</small><strong>linkedin.com/in/saifulislampro</strong></div></a><a href={github} target="_blank" rel="noreferrer"><span className="icon-box"><Icon name="github" /></span><div><small>GitHub</small><strong>github.com/SaifulIslamDS</strong></div></a><div><span className="icon-box"><Icon name="map" /></span><div><small>Location</small><strong>{profile.location} · Remote worldwide</strong></div></div></div></div><ContactForm /></div></section></main><SiteFooter/></>;
}
