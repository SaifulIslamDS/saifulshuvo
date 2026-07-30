import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { articles } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Insights",
  description: "Articles on data analytics, AI, web development and product-building.",
};

export default function BlogPage() {
  return (
    <>
      <SiteHeader />
      <main className="inner-page">
        <section className="page-hero section-shell">
          <div className="container">
            <SectionHeading
              eyebrow="Ideas and learning"
              title="Notes from my journey through data, AI and product development"
              description="This CMS-ready section will contain practical articles, project lessons, career reflections and technical learning guides."
            />
          </div>
        </section>
        <section className="section-shell compact-top">
          <div className="container article-grid">
            {articles.map((article, index) => (
              <article className={`article-card article-card-${index + 1}`} key={article.slug}>
                <div className="article-visual"><Icon name={index === 0 ? "chart" : index === 1 ? "code" : "brain"} size={38} /></div>
                <span className="eyebrow">{article.category}</span>
                <h2>{article.title}</h2>
                <p>{article.excerpt}</p>
                <div className="article-meta"><span>{article.date}</span><span>{article.readTime}</span></div>
                <Link href="#" className="text-link">Article coming soon <Icon name="arrow" size={17} /></Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
