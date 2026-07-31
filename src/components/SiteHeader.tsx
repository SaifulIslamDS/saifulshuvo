import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getPublicSiteMedia } from "@/lib/media/queries";
import { getHomepageContent } from "@/lib/profile/queries";

const nav = [["About", "/#about"], ["Skills", "/#skills"], ["Projects", "/projects"], ["Blog", "/blog"], ["Contact", "/contact"]];
function initials(name: string): string { return name.split(/\s+/).filter(Boolean).slice(0,2).map((part) => part[0]?.toUpperCase()).join("") || "SI"; }

export async function SiteHeader() {
  const [content, media] = await Promise.all([getHomepageContent(), getPublicSiteMedia()]);
  const cvHref = media.activeCv ? "/cv" : `mailto:${content.contactEmail}?subject=${encodeURIComponent(`CV Request for ${content.ownerName}`)}`;
  const cvLabel = media.activeCv ? "Download CV" : "Request CV";
  return <header className="site-header"><div className="container header-inner"><Link href="/" className="brand" aria-label={`${content.ownerName} home`}><span className="brand-mark">{initials(content.ownerName)}</span><span><strong>{content.ownerName}</strong><small>Data · AI · Web</small></span></Link><nav className="desktop-nav" aria-label="Primary navigation">{nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><div className="header-actions"><ThemeToggle/><a className="button button-ghost header-cv" href={cvHref} target={media.activeCv ? "_blank" : undefined} rel={media.activeCv ? "noreferrer" : undefined}><Icon name="download" size={17}/>{cvLabel}</a><details className="mobile-menu"><summary aria-label="Open navigation menu"><Icon name="menu" size={22}/></summary><nav aria-label="Mobile navigation">{nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<a href={cvHref} target={media.activeCv ? "_blank" : undefined} rel={media.activeCv ? "noreferrer" : undefined}>{cvLabel}</a><Link href="/admin">Portfolio CMS</Link></nav></details></div></div></header>;
}
