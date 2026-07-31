"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("portfolio:client-error", { detail: { message: error.message, source: "app-error-boundary", stack: error.stack } }));
  }, [error]);
  return <main className="error-boundary-page" id="main-content"><div><span>Something went wrong</span><h1>The page could not be completed.</h1><p>Please retry. If the problem continues, use the contact page and mention reference <code>{error.digest ?? "client"}</code>.</p><button className="button button-primary" type="button" onClick={reset}>Try again</button></div></main>;
}
