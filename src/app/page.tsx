import Link from "next/link";
import type { ReactNode } from "react";
import { BlogCard } from "@/components/BlogCard";
import { DashboardVisual } from "@/components/DashboardVisual";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublicPosts } from "@/lib/posts/queries";
import { getPublicProjects } from "@/lib/projects/queries";
import { getPublicSiteMedia } from "@/lib/media/queries";
import { getExperienceEntries, getHomepageContent, getServices, getSkillGroups } from "@/lib/profile/queries";
import { getSiteUrl } from "@/lib/supabase/env";

function SmartLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  return href.startsWith("/") ? <Link href={href} className={className}>{children}</Link> : <a href={href} className={className} target="_blank" rel="noreferrer">{children}</a>;
}

export default async function HomePage() {
  const [featured, latestPosts, siteMedia, content, skillGroups, experiences, services] = await Promise.all([
    getPublicProjects({ featuredOnly: true, limit: 6 }),
    getPublicPosts({ limit: 3 }),
    getPublicSiteMedia(),
    getHomepageContent(),
    getSkillGroups(),
    getExperienceEntries({ featuredOnly: true }),
    getServices(),
  ]);
  const publicGroups = skillGroups.filter((group) => group.featured && group.active);
  const primarySkills = publicGroups.flatMap((group) => group.skills.filter((skill) => skill.featured && skill.active)).slice(0, 12);
  const githubUrl = content.socialLinks.github || "https://github.com/SaifulIslamDS";
  const linkedinUrl = content.socialLinks.linkedin || "https://www.linkedin.com/in/saifulislampro";
  const siteUrl = getSiteUrl();
  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: content.ownerName,
      url: siteUrl,
      jobTitle: content.professionalTitle,
      description: content.shortBio,
      email: `mailto:${content.contactEmail}`,
      address: { "@type": "PostalAddress", addressLocality: content.location },
      sameAs: [githubUrl, linkedinUrl, content.socialLinks.website].filter(Boolean),
      knowsAbout: primarySkills.map((skill) => skill.name),
      image: siteMedia.profileImage?.publicUrl,
    },
  };

  return (
    <>
      <JsonLd data={profileSchema}/>
      <SiteHeader />
      <main id="main-content">
        <section className="hero section-shell">
          <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="availability"><span /> {content.availability}</div>
              <p className="hero-kicker">{content.heroEyebrow}</p>
              <h1>{content.heroHeading} <span>{content.heroEmphasis}</span></h1>
              <p className="hero-role">{content.professionalTitle}</p>
              <p className="hero-lead">{content.heroLead}</p>
              <div className="hero-actions">
                <SmartLink href={content.heroPrimaryHref} className="button button-primary">{content.heroPrimaryLabel} <Icon name="arrow" size={18}/></SmartLink>
                <SmartLink href={content.heroSecondaryHref} className="button button-secondary">{content.heroSecondaryLabel}</SmartLink>
                {siteMedia.activeCv ? <a href="/cv" className="button button-ghost" target="_blank" rel="noreferrer"><Icon name="download" size={17}/> Download CV</a> : null}
              </div>
              <div className="hero-socials"><span>Connect</span><a href={githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub"><Icon name="github"/></a><a href={linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Icon name="linkedin"/></a><a href={`mailto:${content.contactEmail}`} aria-label={`Email ${content.ownerName}`}><Icon name="mail"/></a></div>
            </div>
            <div className="hero-art"><DashboardVisual/><div className={`portrait-placeholder ${siteMedia.profileImage ? "portrait-has-image" : ""}`} aria-label={`${content.ownerName} profile image`}>{siteMedia.profileImage ? <img src={siteMedia.profileImage.publicUrl} alt={siteMedia.profileImage.altText ?? content.ownerName} width={siteMedia.profileImage.width ?? 480} height={siteMedia.profileImage.height ?? 600} fetchPriority="high" decoding="async"/> : <div className="portrait-ring"><div className="portrait-core">SI</div></div>}<span>{siteMedia.profileImage?.caption ?? content.ownerName}</span></div></div>
          </div>
          {content.stats.length ? <div className="container trust-strip">{content.stats.map((item, index) => <div key={`${item.label}-${index}`}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div> : null}
        </section>

        {content.sectionVisibility.about ? <section id="about" className="section-shell about-section"><div className="container about-grid"><div><SectionHeading eyebrow={content.aboutEyebrow} title={content.aboutTitle} description={content.aboutDescription}/><div className="about-copy">{content.aboutParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><div className="about-actions"><Link href="/projects" className="text-link">Explore the project journey <Icon name="arrow" size={17}/></Link></div></div><div className="focus-card"><span className="eyebrow">Professional positioning</span><h3>{content.positioningTitle}</h3><ul className="check-list">{content.positioningPoints.map((point) => <li key={point}><Icon name="check" size={17}/> {point}</li>)}</ul><div className="focus-roadmap"><span className="active">Current<br/><b>Analytics &amp; Apps</b></span><i/><span>Expanding<br/><b>Data &amp; ML</b></span><i/><span>Direction<br/><b>Intelligent Systems</b></span></div></div></div></section> : null}

        {content.sectionVisibility.experience && experiences.length ? <section className="section-shell experience-section"><div className="container"><SectionHeading eyebrow="Professional foundation" title="Experience that connects operations, clients, data and technology" description="Practical work, business exposure, client service and continuous self-directed learning support my current technical direction."/><div className="experience-grid">{experiences.map((item) => <article className="experience-card" key={item.id}><span>{item.periodLabel || (item.current ? "Present" : item.startDate?.slice(0,4) || "Experience")}</span><h3>{item.title}</h3><small>{item.organization}</small><p>{item.summary}</p>{item.technologies.length ? <div className="skill-tags compact-tags">{item.technologies.slice(0,5).map((technology) => <span key={technology}>{technology}</span>)}</div> : null}</article>)}</div></div></section> : null}

        {content.sectionVisibility.services && services.length ? <section className="section-shell services-section"><div className="container"><SectionHeading eyebrow="What I can contribute" title="Business-aware technology capabilities" description="A practical combination of analytics, development, WordPress, operations and AI-assisted execution for roles and projects that cross traditional boundaries." centered/><div className="service-grid">{services.map((service) => <article className={`service-card accent-card-${service.accent}`} key={service.id}><span className="icon-box"><Icon name={service.icon} size={24}/></span><h3>{service.title}</h3><p>{service.description}</p></article>)}</div></div></section> : null}

        {content.sectionVisibility.skills && publicGroups.length ? <section id="skills" className="section-shell skills-section"><div className="container"><SectionHeading eyebrow="Skills and tools" title="A broad professional toolkit with a focused career direction" description="Featured capabilities reflect my analytics and modern application work. Supporting skills show the business, creative and operational context I bring to a team."/>{primarySkills.length ? <div className="primary-stack">{primarySkills.map((skill) => <span key={skill.id}>{skill.name}{skill.learning ? " · learning" : ""}</span>)}</div> : null}<div className="skills-grid">{publicGroups.map((group) => <article className={`skill-card accent-card-${group.accent}`} key={group.id}><div className="skill-title"><span className="icon-box small"><Icon name={group.icon} size={20}/></span><div><h3>{group.title}</h3>{group.description ? <small>{group.description}</small> : null}</div></div><div className="skill-tags">{group.skills.filter((skill) => skill.active).map((skill) => <span key={skill.id} title={skill.description}>{skill.name}{skill.learning ? " · learning" : ""}</span>)}</div></article>)}</div></div></section> : null}

        {content.sectionVisibility.projects ? <section className="section-shell projects-section"><div className="container"><div className="section-row"><SectionHeading eyebrow="Featured work" title="Projects shaped by real business and user problems" description="Selected analytics, AI and application initiatives showing how I define requirements, design workflows, build iteratively and document evidence."/><Link href="/projects" className="button button-secondary">View all projects <Icon name="arrow" size={17}/></Link></div><div className="projects-grid">{featured.map((project) => <ProjectCard project={project} key={project.id}/>)}</div></div></section> : null}

        {content.sectionVisibility.insights && latestPosts.posts.length ? <section className="section-shell insights-section"><div className="container"><div className="section-row"><SectionHeading eyebrow="Latest insights" title="Practical writing on data, AI and building useful products" description="Articles that turn current learning, project decisions and business experience into reusable knowledge."/><Link href="/blog" className="button button-secondary">Browse all articles <Icon name="arrow" size={17}/></Link></div><div className="blog-grid home-blog-grid">{latestPosts.posts.map((post) => <BlogCard key={post.id} post={post}/>)}</div></div></section> : null}

        {content.sectionVisibility.process ? <section className="section-shell values-section"><div className="container values-grid"><div><SectionHeading eyebrow="How I work" title="Structured thinking, verifiable milestones and continuous iteration" description="I separate product planning from implementation, develop in small milestones and audit the result before treating a release as complete."/><div className="process-list">{content.processItems.map((item) => <div key={`${item.number}-${item.title}`}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></div>)}</div></div><aside className="why-card"><span className="eyebrow">Why work with me</span><h3>Technical curiosity grounded in business reality.</h3><ul className="check-list">{content.workPrinciples.map((item) => <li key={item}><Icon name="check" size={17}/> {item}</li>)}</ul></aside></div></section> : null}

        {content.sectionVisibility.cta ? <section className="section-shell cta-section"><div className="container cta-card"><div><span className="eyebrow">{content.ctaEyebrow}</span><h2>{content.ctaTitle}</h2><p>{content.ctaDescription}</p></div><div className="cta-actions"><SmartLink href={content.ctaPrimaryHref} className="button button-light">{content.ctaPrimaryLabel} <Icon name="arrow" size={18}/></SmartLink><SmartLink href={content.ctaSecondaryHref} className="button button-transparent">{content.ctaSecondaryLabel}</SmartLink></div></div></section> : null}
      </main>
      <SiteFooter/>
    </>
  );
}
