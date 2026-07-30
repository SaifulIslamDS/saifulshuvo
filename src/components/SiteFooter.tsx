import Link from "next/link";
import { Icon } from "@/components/Icon";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="brand footer-brand">
            <span className="brand-mark">SI</span>
            <span><strong>Saiful Islam</strong><small>Building useful digital solutions</small></span>
          </Link>
          <p className="footer-copy">
            A data-focused professional and software builder combining analytics,
            business knowledge and modern web technologies.
          </p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/#about">About</Link>
          <Link href="/#skills">Skills</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/blog">Insights</Link>
        </div>
        <div>
          <h3>Connect</h3>
          <a href="https://github.com/SaifulIslamDS" target="_blank" rel="noreferrer">
            <Icon name="github" size={16} /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/saifulislampro" target="_blank" rel="noreferrer">
            <Icon name="linkedin" size={16} /> LinkedIn
          </a>
          <Link href="/contact"><Icon name="mail" size={16} /> Contact</Link>
        </div>
        <div>
          <h3>Site</h3>
          <Link href="/admin">Admin UI Preview</Link>
          <span>Bangladesh</span>
          <span>Available for remote opportunities</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Saiful Islam. All rights reserved.</span>
        <span>Designed for a future CMS-powered portfolio.</span>
      </div>
    </footer>
  );
}
