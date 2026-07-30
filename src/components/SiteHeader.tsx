import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";

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
          <ThemeToggle />
          <a className="button button-ghost header-cv" href="mailto:mail@saifulshuvo.com?subject=CV%20Request%20for%20Saiful%20Islam">
            <Icon name="download" size={17} />
            Request CV
          </a>
          <details className="mobile-menu">
            <summary aria-label="Open navigation menu">
              <Icon name="menu" size={22} />
            </summary>
            <nav aria-label="Mobile navigation">
              {nav.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
              <a href="mailto:mail@saifulshuvo.com?subject=CV%20Request%20for%20Saiful%20Islam">Request CV</a>
              <Link href="/admin">Admin UI Preview</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
