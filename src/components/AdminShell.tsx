import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { AdminIdentity } from "@/lib/auth/admin";
import { signOut } from "@/app/admin/login/actions";

const adminNav = [
  ["Dashboard", "/admin", "chart"],
  ["Projects", "/admin/projects", "folder"],
  ["Posts", "/admin/posts", "file"],
  ["Homepage", "/admin/homepage", "spark"],
  ["Skills", "/admin/skills", "layers"],
  ["Experience", "/admin/experience", "briefcase"],
  ["Media", "/admin/media", "image"],
  ["Profile & CV", "/admin/settings", "settings"],
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SI";
}

export function AdminShell({
  children,
  user,
}: {
  children: ReactNode;
  user: AdminIdentity;
}) {
  const initials = getInitials(user.name);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="brand admin-brand">
          <span className="brand-mark">SI</span>
          <span><strong>Portfolio CMS</strong><small>Profile CMS v0.7.0</small></span>
        </Link>
        <nav className="admin-nav" aria-label="Admin navigation">
          {adminNav.map(([label, href, icon]) => (
            <Link key={href} href={href}><Icon name={icon} size={18} />{label}</Link>
          ))}
        </nav>
        <div className="admin-sidebar-note cms-connected-note">
          <span className="status-dot" />
          <div><strong>Profile CMS active</strong><small>Homepage + skills + experience + media</small></div>
        </div>
        <Link href="/" className="button button-secondary admin-view-site"><Icon name="eye" size={17} /> View website</Link>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div><span className="eyebrow">Portfolio administration</span><strong>Secure content workspace</strong></div>
          <div className="admin-topbar-actions">
            <ThemeToggle />
            <div className="admin-profile">
              <span>{initials}</span>
              <div><strong>{user.name}</strong><small>{user.email}</small></div>
            </div>
            <form action={signOut}>
              <button className="admin-signout" type="submit" aria-label="Sign out" title="Sign out">
                <Icon name="logout" size={19} />
              </button>
            </form>
          </div>
        </header>
        <div className="admin-mobile-nav">
          {adminNav.map(([label, href, icon]) => <Link key={href} href={href}><Icon name={icon} size={17}/>{label}</Link>)}
        </div>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
