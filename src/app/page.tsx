import Link from "next/link";
import { DashboardVisual } from "@/components/DashboardVisual";
import { Icon } from "@/components/Icon";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { primarySkills, projects, services, skillGroups } from "@/data/portfolio";

const featured = projects.filter((project) => project.featured);

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero section-shell">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="availability"><span /> Available for remote opportunities</div>
              <p className="hero-kicker">DATA ANALYTICS · AI · WEB PRODUCTS</p>
              <h1>
                Turning data and ideas into <span>intelligent solutions.</span>
              </h1>
              <p className="hero-lead">
                I combine analytical thinking, business experience and modern web technologies
                to build dashboards, digital products and practical AI-assisted workflows.
              </p>
              <div className="hero-actions">
                <Link href="/projects" className="button button-primary">
                  Explore my work <Icon name="arrow" size={18} />
                </Link>
                <Link href="/contact" className="button button-secondary">
                  Let&apos;s connect
                </Link>
              </div>
              <div className="hero-socials">
                <span>Find me on</span>
                <a href="https://github.com/SaifulIslamDS" target="_blank" rel="noreferrer" aria-label="GitHub">
                  <Icon name="github" />
                </a>
                <a href="https://www.linkedin.com/in/saifulislampro" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <Icon name="linkedin" />
                </a>
                <Link href="/contact" aria-label="Contact"><Icon name="mail" /></Link>
              </div>
            </div>

            <div className="hero-art">
              <DashboardVisual />
              <div className="portrait-placeholder" aria-label="Profile image placeholder">
                <div className="portrait-ring"><div className="portrait-core">SI</div></div>
                <span>Profile photo placeholder</span>
              </div>
            </div>
          </div>

          <div className="container trust-strip">
            <div><strong>13+</strong><span>Years of professional experience</span></div>
            <div><strong>4</strong><span>Analytics portfolio projects</span></div>
            <div><strong>7+</strong><span>Product and application initiatives</span></div>
            <div><strong>∞</strong><span>Commitment to continuous learning</span></div>
          </div>
        </section>

        <section id="about" className="section-shell about-section">
          <div className="container about-grid">
            <div>
              <SectionHeading
                eyebrow="About me"
                title="A multidisciplinary professional moving deeper into data and AI."
                description="My strength is not only knowing tools. It is connecting business needs, data, people and technology to create practical outcomes."
              />
              <div className="about-copy">
                <p>
                  I work across data analytics, web development, project management, business operations,
                  accounting, digital marketing and AI-assisted product development. That broad foundation
                  helps me understand problems from both technical and operational perspectives.
                </p>
                <p>
                  My current career direction is focused on Data Analytics, Data Science, Data Engineering,
                  Machine Learning, Deep Learning, LLMs and Agentic AI—with the goal of contributing to
                  international remote teams and building useful software products.
                </p>
              </div>
              <div className="about-actions">
                <Link href="/projects" className="text-link">See my project journey <Icon name="arrow" size={17} /></Link>
              </div>
            </div>
            <div className="focus-card">
              <span className="eyebrow">Career focus</span>
              <h3>From business systems to intelligent systems</h3>
              <ul className="check-list">
                <li><Icon name="check" size={17} /> Build decision-ready analytics</li>
                <li><Icon name="check" size={17} /> Develop production-quality web applications</li>
                <li><Icon name="check" size={17} /> Apply LLMs to real workflows</li>
                <li><Icon name="check" size={17} /> Grow toward ML, data engineering and agentic AI</li>
              </ul>
              <div className="focus-roadmap">
                <span className="active">Now<br/><b>Analytics</b></span>
                <i />
                <span>Next<br/><b>Data Science</b></span>
                <i />
                <span>Future<br/><b>AI Systems</b></span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell services-section">
          <div className="container">
            <SectionHeading
              eyebrow="What I do"
              title="Business-aware technology services"
              description="A combination of analytical, development and operational skills for projects that need more than one narrow perspective."
              centered
            />
            <div className="service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.title}>
                  <span className="icon-box"><Icon name={service.icon} size={24} /></span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="section-shell skills-section">
          <div className="container">
            <SectionHeading
              eyebrow="Capabilities"
              title="A broad toolkit with a focused direction"
              description="The primary stack highlights my current portfolio focus. Supporting capabilities reflect the business and creative experience I bring to a team."
            />
            <div className="primary-stack">
              {primarySkills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
            <div className="skills-grid">
              {skillGroups.map((group) => (
                <article className="skill-card" key={group.title}>
                  <div className="skill-title"><span className="icon-box small"><Icon name={group.icon} size={20} /></span><h3>{group.title}</h3></div>
                  <div className="skill-tags">
                    {group.skills.map((skill) => <span key={skill}>{skill}</span>)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell projects-section">
          <div className="container">
            <div className="section-row">
              <SectionHeading
                eyebrow="Featured work"
                title="Projects shaped by real problems"
                description="Selected analytics, AI and application initiatives that show how I plan, build, iterate and document solutions."
              />
              <Link href="/projects" className="button button-secondary">View all projects <Icon name="arrow" size={17} /></Link>
            </div>
            <div className="projects-grid">
              {featured.map((project) => <ProjectCard project={project} key={project.slug} />)}
            </div>
          </div>
        </section>

        <section className="section-shell values-section">
          <div className="container values-grid">
            <div>
              <SectionHeading
                eyebrow="How I work"
                title="Structured thinking, continuous iteration"
                description="I approach projects as a cycle: understand the problem, design the workflow, build carefully, audit the result and improve with evidence."
              />
              <div className="process-list">
                {[
                  ["01", "Understand", "Clarify users, business context, data and success criteria."],
                  ["02", "Design", "Create a clean information architecture and practical workflow."],
                  ["03", "Build", "Develop in small, verifiable milestones with maintainable structure."],
                  ["04", "Audit", "Test, document, fix and improve before calling the work complete."],
                ].map(([number, title, text]) => (
                  <div key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></div>
                ))}
              </div>
            </div>
            <aside className="why-card">
              <span className="eyebrow">Why work with me</span>
              <h3>Technical curiosity grounded in business reality.</h3>
              <ul className="check-list">
                <li><Icon name="check" size={17} /> Analytical and detail-oriented</li>
                <li><Icon name="check" size={17} /> Comfortable across business and technology</li>
                <li><Icon name="check" size={17} /> Strong documentation and project discipline</li>
                <li><Icon name="check" size={17} /> Adaptable, self-driven and committed to learning</li>
                <li><Icon name="check" size={17} /> Open to remote collaboration worldwide</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="section-shell cta-section">
          <div className="container cta-card">
            <div>
              <span className="eyebrow">Let&apos;s build something useful</span>
              <h2>Need a data-focused professional who can also understand products and operations?</h2>
              <p>I am open to remote roles, project collaborations and meaningful technology opportunities.</p>
            </div>
            <div className="cta-actions">
              <Link href="/contact" className="button button-light">Start a conversation <Icon name="arrow" size={18} /></Link>
              <a href="https://www.linkedin.com/in/saifulislampro" target="_blank" rel="noreferrer" className="button button-transparent">
                LinkedIn profile
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
