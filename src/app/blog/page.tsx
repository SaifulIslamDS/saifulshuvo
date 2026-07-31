import type { Metadata } from "next";
import { BlogListing } from "@/components/BlogListing";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPostTaxonomies, getPublicPosts } from "@/lib/posts/queries";

export const metadata: Metadata = {
  title: "Insights",
  description: "Practical articles on data analytics, AI, SaaS development, web applications and career growth.",
  alternates: { canonical: "/blog" },
};

type Props = { searchParams: Promise<{ q?: string; category?: string; tag?: string; page?: string }> };

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const [result, taxonomies] = await Promise.all([
    getPublicPosts({ query: params.q, category: params.category, tag: params.tag, page, pageSize: 9 }),
    getPostTaxonomies(),
  ]);
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="inner-page">
        <section className="page-hero section-shell blog-page-hero">
          <div className="container">
            <SectionHeading
              eyebrow="Ideas and learning"
              title="Practical notes from data, AI and product development"
              description="Business-aware articles, project lessons, technical guides and reflections from an ongoing transition toward intelligent data products."
            />
          </div>
        </section>
        <section className="section-shell compact-top"><div className="container">
          <BlogListing result={result} categories={taxonomies.categories} tags={taxonomies.tags} query={params.q} category={params.category} tag={params.tag} />
        </div></section>
      </main>
      <SiteFooter />
    </>
  );
}
