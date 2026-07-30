import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { hasCmsConfiguration } from "@/lib/supabase/env";
import { signInWithGoogle } from "./actions";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  configuration:
    "CMS environment variables are not configured yet. Complete the Supabase setup before signing in.",
  oauth: "Google sign-in could not be started. Check the provider and redirect URL configuration.",
  callback: "The authentication callback could not create a valid session. Please try again.",
  not_authorized:
    "This Google account is not on the single-admin allow-list. Sign in with the configured owner account.",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; signedOut?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const configured = hasCmsConfiguration();
  const admin = configured ? await getCurrentAdmin() : null;
  if (admin) redirect("/admin");

  const params = await searchParams;
  const message = params.error ? errorMessages[params.error] : null;

  return (
    <main className="admin-login-page">
      <div className="admin-login-grid" aria-hidden="true" />
      <div className="admin-login-topbar">
        <Link href="/" className="brand" aria-label="Return to portfolio">
          <span className="brand-mark">SI</span>
          <span>
            <strong>Portfolio CMS</strong>
            <small>Owner administration</small>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <section className="admin-login-card">
        <span className="admin-login-icon"><Icon name="shield" size={30} /></span>
        <span className="eyebrow">Secure administration</span>
        <h1>Sign in to manage the portfolio</h1>
        <p>
          Access is restricted to one approved Google account. Public registration,
          password login and multi-user access are disabled.
        </p>

        {message ? <div className="auth-message auth-error"><Icon name="lock" size={18} />{message}</div> : null}
        {params.signedOut ? <div className="auth-message auth-success"><Icon name="check" size={18} />You have signed out securely.</div> : null}
        {!configured ? (
          <div className="auth-setup-box">
            <strong>Setup required</strong>
            <span>Add the Supabase variables and ADMIN_EMAIL described in docs/SUPABASE-SETUP.md.</span>
          </div>
        ) : null}

        <form action={signInWithGoogle}>
          <button className="button google-login-button" type="submit" disabled={!configured}>
            <span className="google-mark" aria-hidden="true">G</span>
            Continue with Google
          </button>
        </form>

        <div className="admin-login-security">
          <span><Icon name="lock" size={15} /> Server-verified session</span>
          <span><Icon name="database" size={15} /> Database RLS protection</span>
        </div>
        <Link href="/" className="admin-login-back"><Icon name="arrow" size={16} /> Return to public website</Link>
      </section>
    </main>
  );
}
