import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AnalyticsManager } from "@/components/AnalyticsManager";
import { getSeoAnalyticsSettings } from "@/lib/seo/queries";
import { getSiteUrl } from "@/lib/supabase/env";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSeoAnalyticsSettings();
  const siteUrl = getSiteUrl();
  const socialImage = settings.ogImageUrl || `${siteUrl}/opengraph-image`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings.defaultTitle, template: settings.titleTemplate },
    description: settings.defaultDescription,
    keywords: settings.keywords,
    authors: [{ name: "Saiful Islam", url: siteUrl }],
    creator: "Saiful Islam",
    category: "technology",
    alternates: { canonical: "/" },
    robots: settings.indexSite
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
      : { index: false, follow: false, noarchive: true },
    verification: {
      google: settings.googleSiteVerification,
      other: settings.bingSiteVerification ? { "msvalidate.01": [settings.bingSiteVerification] } : undefined,
    },
    openGraph: {
      title: settings.defaultTitle,
      description: settings.defaultDescription,
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: "Saiful Islam Portfolio",
      images: [{ url: socialImage, alt: settings.ogImageAlt || "Saiful Islam professional portfolio" }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.defaultTitle,
      description: settings.defaultDescription,
      creator: settings.twitterHandle,
      images: [socialImage],
    },
    manifest: "/manifest.webmanifest",
  };
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const settings = await getSeoAnalyticsSettings();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        {children}
        <AnalyticsManager settings={settings}/>
      </body>
    </html>
  );
}
