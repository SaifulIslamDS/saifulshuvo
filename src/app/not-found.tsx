import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return <><SiteHeader /><main id="main-content" className="empty-state"><span>404</span><h1>Page not found</h1><p>The page you are looking for is not available.</p><Link className="button button-primary" href="/">Return home</Link></main><SiteFooter /></>;
}
