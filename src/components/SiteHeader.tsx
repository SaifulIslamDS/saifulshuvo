import Link from "next/link";
import { Icon } from "@/components/Icon";

const nav = [
  ["About", "/#about"],
  ["Skills", "/#skills"],
  ["Projects", "/projects"],
  ["Blog", "/blog"],
  ["Contact", "/contact"],
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Saiful Islam home">
          <span className="brand-mark">SI</span>
          <span>
            <strong>Saiful Islam</strong>
            <small>Data · AI · Web</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="button button-ghost header-cv" href="/contact">
            <Icon name="download" size={17} />
            Download CV
          </Link>
          <details className="mobile-menu">
            <summary aria-label="Open menu">
              <Icon name="menu" size={22} />
            </summary>
            <nav aria-label="Mobile navigation">
              {nav.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
              <Link href="/admin">Admin UI Preview</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
