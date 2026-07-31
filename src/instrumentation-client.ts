function dispatchClientError(message: string, source: string, stack?: string) {
  try {
    window.dispatchEvent(new CustomEvent("portfolio:client-error", {
      detail: { message, source, stack },
    }));
  } catch {
    // Instrumentation failures must not affect hydration.
  }
}

window.addEventListener("error", (event) => {
  dispatchClientError(
    event.message || "Unhandled browser error",
    event.filename || "window.error",
    event.error instanceof Error ? event.error.stack : undefined,
  );
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  dispatchClientError(
    reason instanceof Error ? reason.message : String(reason ?? "Unhandled promise rejection"),
    "unhandledrejection",
    reason instanceof Error ? reason.stack : undefined,
  );
});

export function onRouterTransitionStart(url: string, navigationType: "push" | "replace" | "traverse") {
  try {
    performance.mark(`portfolio-nav-${navigationType}-${url}-${Date.now()}`);
  } catch {
    // Performance marks are optional.
  }
}
