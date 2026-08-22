import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListing } from "@/components/BlogListing";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllPublicPosts, getPostTaxonomies } from "@/lib/wordpress/queries/posts";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const { tags } = await getPostTaxonomies();
  return tags.map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { tags } = await getPostTaxonomies();
  const tag = tags.find((item) => item.slug === slug);
  return tag ? { title: `${tag.name} Articles`, description: `Articles tagged ${tag.name}.`, alternates: { canonical: `/blog/tag/${slug}` } } : { title: "Tag not found", robots: { index: false, follow: false } };
}

export default async function TagArchivePage({ params }: Props) {
  const { slug } = await params;
  const [taxonomies, posts] = await Promise.all([getPostTaxonomies(), getAllPublicPosts()]);
  const tag = taxonomies.tags.find((item) => item.slug === slug);
  if (!tag) notFound();
  return <><SiteHeader/><main id="main-content" className="inner-page"><section className="page-hero section-shell"><div className="container"><SectionHeading eyebrow="Topic tag" title={`#${tag.name}`} description={`Published articles connected to ${tag.name}.`} /></div></section><section className="section-shell compact-top"><div className="container"><BlogListing posts={posts} categories={taxonomies.categories} tags={taxonomies.tags} fixedTag={slug} basePath={`/blog/tag/${slug}`} /></div></section></main><SiteFooter/></>;
}
