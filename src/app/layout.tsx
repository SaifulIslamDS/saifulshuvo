import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://saifulshuvo.com"),
  title: {
    default: "Saiful Islam | Data Analyst & AI-Focused Software Builder",
    template: "%s | Saiful Islam",
  },
  description:
    "Portfolio of Saiful Islam — data analytics, business intelligence, web development, SaaS products and AI-assisted solutions.",
  keywords: [
    "Saiful Islam",
    "Data Analyst",
    "Power BI",
    "Python",
    "SQL",
    "Next.js",
    "SaaS Developer",
    "Bangladesh",
  ],
  openGraph: {
    title: "Saiful Islam | Data Analyst & AI-Focused Software Builder",
    description:
      "Data analytics, modern web applications and practical AI-assisted solutions.",
    type: "website",
    url: "https://saifulshuvo.com",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
