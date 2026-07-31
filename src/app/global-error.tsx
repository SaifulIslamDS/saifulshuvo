"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body><main className="error-boundary-page"><div><span>Portfolio unavailable</span><h1>A critical rendering error occurred.</h1><p>The application is protected by a global error boundary. Retry the request or return later.</p><button className="button button-primary" type="button" onClick={reset}>Retry application</button></div></main></body></html>;
}
