import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/PostArticle";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublicPostBySlug, getPublicPostSlugs } from "@/lib/wordpress/queries/posts";
import { getSiteUrl } from "@/lib/wordpress/env";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPublicPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  if (!post) return { title: "Article not found", robots: { index: false, follow: false } };
  const canonical = post.canonicalUrl || `/blog/${post.slug}`;
  const image = post.ogImageUrl || post.featuredImageUrl;
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical },
    openGraph: { type: "article", title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, url: canonical, publishedTime: post.publishedAt, modifiedTime: post.updatedAt, authors: ["Saiful Islam"], section: post.categoryLabel, tags: post.tags.map((tag) => tag.name), images: image ? [{ url: image }] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, images: image ? [image] : undefined },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  if (!post) notFound();
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
  return <><SiteHeader/><main id="main-content" className="inner-page post-public-page"><div className="container"><JsonLd data={structuredData}/><PostArticle post={post}/></div></main><SiteFooter/></>;
}
