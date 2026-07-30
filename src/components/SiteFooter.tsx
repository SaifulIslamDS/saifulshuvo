import Link from "next/link";
import { Icon } from "@/components/Icon";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="brand footer-brand">
            <span className="brand-mark">SI</span>
            <span><strong>Saiful Islam</strong><small>Data · AI · Web Products</small></span>
          </Link>
          <p className="footer-copy">
            A data analyst, web developer and SaaS builder combining business understanding,
            analytics and modern application development to create practical solutions.
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
          <a href="mailto:mail@saifulshuvo.com"><Icon name="mail" size={16} /> Email</a>
        </div>
        <div>
          <h3>Availability</h3>
          <span>Dhaka, Bangladesh</span>
          <span>Remote worldwide</span>
          <span>Data · BI · Web · SaaS</span>
          <Link href="/admin">Admin UI Preview</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Saiful Islam. All rights reserved.</span>
        <span>v0.3.0 · CMS Foundation</span>
      </div>
    </footer>
  );
}
