import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const themeScript = `
  (() => {
    try {
      const savedTheme = localStorage.getItem("portfolio-theme");
      const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      const theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : preferredTheme;
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.style.colorScheme = "dark";
    }
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL("https://saifulshuvo.com"),
  title: {
    default: "Saiful Islam | Data Analyst & AI-Focused Software Builder",
    template: "%s | Saiful Islam",
  },
  description:
    "Portfolio of Saiful Islam, a data analyst, web developer and SaaS builder creating dashboards, business applications and practical AI-assisted solutions.",
  keywords: [
    "Saiful Islam",
    "Data Analyst Bangladesh",
    "Power BI Developer",
    "Python Data Analyst",
    "SQL Analyst",
    "Next.js Developer",
    "SaaS Builder",
    "WordPress Developer",
    "Remote Data Analyst",
  ],
  authors: [{ name: "Saiful Islam", url: "https://saifulshuvo.com" }],
  creator: "Saiful Islam",
  openGraph: {
    title: "Saiful Islam | Data Analyst & AI-Focused Software Builder",
    description:
      "Data analytics, modern web applications, SaaS products and practical AI-assisted solutions.",
    type: "website",
    locale: "en_US",
    url: "https://saifulshuvo.com",
    siteName: "Saiful Islam Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saiful Islam | Data Analyst & AI-Focused Software Builder",
    description: "Data, web products and practical AI-assisted solutions.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
