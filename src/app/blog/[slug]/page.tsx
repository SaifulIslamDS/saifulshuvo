import type { Metadata } from "next";
import { PostArticle } from "@/components/PostArticle";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublicPostBySlug, getPublicPostSlugs } from "@/lib/wordpress/queries/posts";
import { getSiteUrl } from "@/lib/wordpress/env";

type Props = { params: Promise<{ slug: string }> };

// Next.js static export currently requires generateStaticParams() to return at
// least one item. When WordPress has zero published posts, use a build-only
// sentinel route and remove it from out/ in prepare-cpanel-output.mjs.
export const EMPTY_BLOG_BUILD_SLUG = "__saifulshuvo_no_published_posts__";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getPublicPostSlugs();
  return (slugs.length ? slugs : [EMPTY_BLOG_BUILD_SLUG]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug === EMPTY_BLOG_BUILD_SLUG) {
    return {
      title: "No published articles",
      robots: { index: false, follow: false },
    };
  }

  const post = await getPublicPostBySlug(slug);
  if (!post) {
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  }

  const canonical = post.canonicalUrl || `/blog/${post.slug}`;
  const image = post.ogImageUrl || post.featuredImageUrl;

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      url: canonical,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: ["Saiful Islam"],
      section: post.categoryLabel,
      tags: post.tags.map((tag) => tag.name),
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  // This page only exists to satisfy Next.js when the CMS currently has no
  // published blog posts. scripts/prepare-cpanel-output.mjs deletes the route
  // from the final cPanel artifact after the static export completes.
  if (slug === EMPTY_BLOG_BUILD_SLUG) {
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="inner-page post-public-page">
          <div className="container" hidden aria-hidden="true" />
        </main>
        <SiteFooter />
      </>
    );
  }

  const post = await getPublicPostBySlug(slug);

  // With output: "export" and dynamicParams=false, this should only be reached
  // for a slug returned by generateStaticParams(). Render a safe noindex shell
  // rather than introducing a runtime notFound dependency into the export path.
  if (!post) {
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="inner-page post-public-page">
          <div className="container">
            <h1>Article unavailable</h1>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const baseUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: post.ogImageUrl || post.featuredImageUrl || undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: post.canonicalUrl || `${baseUrl}/blog/${post.slug}`,
    author: { "@type": "Person", name: "Saiful Islam", url: baseUrl },
    publisher: { "@type": "Person", name: "Saiful Islam" },
  };

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="inner-page post-public-page">
        <div className="container">
          <JsonLd data={structuredData} />
          <PostArticle post={post} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
