import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AnalyticsPreferencesButton } from "@/components/AnalyticsPreferencesButton";
import { getHomepageContent } from "@/lib/wordpress/queries/profile";
function initials(name: string): string { return name.split(/\s+/).filter(Boolean).slice(0,2).map((part) => part[0]?.toUpperCase()).join("") || "SI"; }
export async function SiteFooter() {
  const content = await getHomepageContent();
  return <footer className="site-footer"><div className="container footer-grid"><div><Link href="/" className="brand footer-brand"><span className="brand-mark">{initials(content.ownerName)}</span><span><strong>{content.ownerName}</strong><small>Data · AI · Web Products</small></span></Link><p className="footer-copy">{content.shortBio}</p></div><div><h3>Explore</h3><Link href="/#about">About</Link><Link href="/#skills">Skills</Link><Link href="/projects">Projects</Link><Link href="/blog">Insights</Link><Link href="/privacy">Privacy</Link><AnalyticsPreferencesButton /></div><div><h3>Connect</h3><a href={content.socialLinks.github || "https://github.com/SaifulIslamDS"} target="_blank" rel="noreferrer"><Icon name="github" size={16}/> GitHub</a><a href={content.socialLinks.linkedin || "https://www.linkedin.com/in/saifulislampro"} target="_blank" rel="noreferrer"><Icon name="linkedin" size={16}/> LinkedIn</a><a href={`mailto:${content.contactEmail}`}><Icon name="mail" size={16}/> Email</a></div><div><h3>Availability</h3><span>{content.location}</span><span>{content.availability}</span><span>Data · BI · Web · SaaS</span></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {content.ownerName}. All rights reserved.</span><span>v1.0.0-rc.1 · WordPress Static</span></div></footer>;
}
