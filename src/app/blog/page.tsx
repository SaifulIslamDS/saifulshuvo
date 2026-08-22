import type { Metadata } from "next";
import { BlogListing } from "@/components/BlogListing";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllPublicPosts, getPostTaxonomies } from "@/lib/wordpress/queries/posts";

export const metadata: Metadata = {
  title: "Insights",
  description: "Practical articles on data analytics, AI, SaaS development, web applications and career growth.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const [posts, taxonomies] = await Promise.all([getAllPublicPosts(), getPostTaxonomies()]);
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="inner-page">
        <section className="page-hero section-shell blog-page-hero"><div className="container"><SectionHeading eyebrow="Ideas and learning" title="Practical notes from data, AI and product development" description="Business-aware articles, project lessons, technical guides and reflections from an ongoing transition toward intelligent data products." /></div></section>
        <section className="section-shell compact-top"><div className="container"><BlogListing posts={posts} categories={taxonomies.categories} tags={taxonomies.tags} /></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
