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
  const { categories } = await getPostTaxonomies();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getPostTaxonomies();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return { title: "Category not found", robots: { index: false, follow: false } };
  return { title: `${category.name} Articles`, description: category.description || `Published articles in ${category.name}.`, alternates: { canonical: `/blog/category/${slug}` } };
}

export default async function CategoryArchivePage({ params }: Props) {
  const { slug } = await params;
  const [taxonomies, posts] = await Promise.all([getPostTaxonomies(), getAllPublicPosts()]);
  const category = taxonomies.categories.find((item) => item.slug === slug);
  if (!category) notFound();
  return <><SiteHeader/><main id="main-content" className="inner-page"><section className="page-hero section-shell"><div className="container"><SectionHeading eyebrow="Blog category" title={category.name} description={category.description || `Published articles in ${category.name}.`} /></div></section><section className="section-shell compact-top"><div className="container"><BlogListing posts={posts} categories={taxonomies.categories} tags={taxonomies.tags} fixedCategory={slug} basePath={`/blog/category/${slug}`} /></div></section></main><SiteFooter/></>;
}
