import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListing } from "@/components/BlogListing";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPostTaxonomies, getPublicPosts } from "@/lib/posts/queries";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ q?: string; page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { tags } = await getPostTaxonomies();
  const tag = tags.find((item) => item.slug === slug);
  return tag ? { title: `${tag.name} Articles`, description: `Articles tagged ${tag.name}.`, alternates: { canonical: `/blog/tag/${slug}` } } : { title: "Tag not found" };
}

export default async function TagArchivePage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const taxonomies = await getPostTaxonomies();
  const tag = taxonomies.tags.find((item) => item.slug === slug);
  if (!tag) notFound();
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const result = await getPublicPosts({ tag: slug, query: query.q, page, pageSize: 9 });
  return <><SiteHeader/><main className="inner-page"><section className="page-hero section-shell"><div className="container"><SectionHeading eyebrow="Topic tag" title={`#${tag.name}`} description={`Published articles connected to ${tag.name}.`} /></div></section><section className="section-shell compact-top"><div className="container"><BlogListing result={result} categories={taxonomies.categories} tags={taxonomies.tags} query={query.q} tag={slug} basePath={`/blog/tag/${slug}`} /></div></section></main><SiteFooter/></>;
}
