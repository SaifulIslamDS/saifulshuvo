import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";

const adminNav = [
  ["Dashboard", "/admin", "chart"],
  ["Projects", "/admin/projects", "folder"],
  ["Posts", "/admin/posts", "file"],
  ["Skills", "/admin/skills", "layers"],
  ["Settings", "/admin/settings", "settings"],
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="brand admin-brand">
          <span className="brand-mark">SI</span>
          <span><strong>Portfolio CMS</strong><small>UI preview</small></span>
        </Link>
        <nav className="admin-nav" aria-label="Admin navigation">
          {adminNav.map(([label, href, icon]) => (
            <Link key={href} href={href}><Icon name={icon} size={18} />{label}</Link>
          ))}
        </nav>
        <div className="admin-sidebar-note">
          <span className="status-dot" />
          <div><strong>Frontend mode</strong><small>Backend not connected</small></div>
        </div>
        <Link href="/" className="button button-secondary admin-view-site"><Icon name="eye" size={17} /> View website</Link>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div><span className="eyebrow">Portfolio administration</span><strong>Content workspace</strong></div>
          <div className="admin-topbar-actions"><ThemeToggle /><div className="admin-profile"><span>SI</span><div><strong>Saiful Islam</strong><small>Owner administrator</small></div></div></div>
        </header>
        <div className="admin-mobile-nav">
          {adminNav.map(([label, href, icon]) => <Link key={href} href={href}><Icon name={icon} size={17}/>{label}</Link>)}
        </div>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
