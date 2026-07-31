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
  const { categories } = await getPostTaxonomies();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return { title: "Category not found" };
  return { title: `${category.name} Articles`, description: category.description, alternates: { canonical: `/blog/category/${slug}` } };
}

export default async function CategoryArchivePage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const taxonomies = await getPostTaxonomies();
  const category = taxonomies.categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const result = await getPublicPosts({ category: slug, query: query.q, page, pageSize: 9 });
  return <><SiteHeader/><main id="main-content" className="inner-page"><section className="page-hero section-shell"><div className="container"><SectionHeading eyebrow="Blog category" title={category.name} description={category.description || `Published articles in ${category.name}.`} /></div></section><section className="section-shell compact-top"><div className="container"><BlogListing result={result} categories={taxonomies.categories} tags={taxonomies.tags} query={query.q} category={slug} basePath={`/blog/category/${slug}`} /></div></section></main><SiteFooter/></>;
}
