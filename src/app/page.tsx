import Link from "next/link";
import { DashboardVisual } from "@/components/DashboardVisual";
import { Icon } from "@/components/Icon";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  experienceHighlights,
  primarySkills,
  projects,
  services,
  skillGroups,
} from "@/data/portfolio";

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
              <div className="availability"><span /> Open to remote opportunities</div>
              <p className="hero-kicker">DATA ANALYTICS · WEB APPLICATIONS · APPLIED AI</p>
              <h1>
                Turning business problems into <span>useful digital solutions.</span>
              </h1>
              <p className="hero-role">Data Analyst &amp; AI-Focused Software Builder</p>
              <p className="hero-lead">
                I combine 13+ years of professional experience, 7+ years of website development,
                business understanding and modern data technologies to create dashboards,
                applications and practical AI-assisted workflows.
              </p>
              <div className="hero-actions">
                <Link href="/projects" className="button button-primary">
                  Explore my work <Icon name="arrow" size={18} />
                </Link>
                <Link href="/contact" className="button button-secondary">
                  Discuss an opportunity
                </Link>
              </div>
              <div className="hero-socials">
                <span>Connect</span>
                <a href="https://github.com/SaifulIslamDS" target="_blank" rel="noreferrer" aria-label="GitHub">
                  <Icon name="github" />
                </a>
                <a href="https://www.linkedin.com/in/saifulislampro" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <Icon name="linkedin" />
                </a>
                <a href="mailto:mail@saifulshuvo.com" aria-label="Email Saiful Islam"><Icon name="mail" /></a>
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
            <div><strong>7+</strong><span>Years in website development</span></div>
            <div><strong>4</strong><span>End-to-end analytics projects</span></div>
            <div><strong>8+</strong><span>Software and product initiatives</span></div>
          </div>
        </section>

        <section id="about" className="section-shell about-section">
          <div className="container about-grid">
            <div>
              <SectionHeading
                eyebrow="About me"
                title="A multidisciplinary professional moving deeper into data and intelligent systems."
                description="My advantage is not a single tool. It is the ability to connect business processes, data, users and technology to create practical outcomes."
              />
              <div className="about-copy">
                <p>
                  I began my development journey with HTML, CSS, JavaScript, PHP and WordPress,
                  delivering responsive websites, customisation and digital work for local and
                  international clients. Today, I build modern application interfaces with React,
                  Next.js, TypeScript, Node.js, Supabase and PostgreSQL.
                </p>
                <p>
                  Alongside development, I am building a professional analytics portfolio with Excel,
                  Power BI, SQL and Python. My career direction is toward Data Analytics, Data Science,
                  Data Engineering, Machine Learning, Deep Learning, LLMs and Agentic AI, with a focus
                  on international remote teams and business-oriented technology products.
                </p>
              </div>
              <div className="about-actions">
                <Link href="/projects" className="text-link">Explore the project journey <Icon name="arrow" size={17} /></Link>
              </div>
            </div>
            <div className="focus-card">
              <span className="eyebrow">Professional positioning</span>
              <h3>Business-aware data and software execution</h3>
              <ul className="check-list">
                <li><Icon name="check" size={17} /> Analyse data and communicate decisions clearly</li>
                <li><Icon name="check" size={17} /> Build responsive, maintainable web applications</li>
                <li><Icon name="check" size={17} /> Translate workflows into structured digital products</li>
                <li><Icon name="check" size={17} /> Apply LLMs and AI tools responsibly to real work</li>
              </ul>
              <div className="focus-roadmap">
                <span className="active">Current<br/><b>Analytics &amp; Apps</b></span>
                <i />
                <span>Expanding<br/><b>Data &amp; ML</b></span>
                <i />
                <span>Direction<br/><b>Intelligent Systems</b></span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell experience-section">
          <div className="container">
            <SectionHeading
              eyebrow="Professional foundation"
              title="Experience that connects operations, clients, data and technology"
              description="My current technical direction is supported by years of practical work, business exposure, client service and continuous self-directed learning."
            />
            <div className="experience-grid">
              {experienceHighlights.map((item) => (
                <article className="experience-card" key={item.title}>
                  <span>{item.period}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell services-section">
          <div className="container">
            <SectionHeading
              eyebrow="What I can contribute"
              title="Business-aware technology capabilities"
              description="A practical combination of analytics, development, WordPress, operations and AI-assisted execution for roles and projects that cross traditional boundaries."
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
              eyebrow="Skills and tools"
              title="A broad professional toolkit with a focused career direction"
              description="The primary stack reflects my analytics and modern application work. Supporting skills show the business, creative and operational context I bring to a team."
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
                title="Projects shaped by real business and user problems"
                description="Selected analytics, AI and application initiatives showing how I define requirements, design workflows, build iteratively and document evidence."
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
                title="Structured thinking, verifiable milestones and continuous iteration"
                description="I separate product planning from implementation, develop in small milestones and audit the result before treating a release as complete."
              />
              <div className="process-list">
                {[
                  ["01", "Understand", "Clarify users, business context, available data, constraints and success criteria."],
                  ["02", "Design", "Create a clean information architecture, workflow, requirements and technical direction."],
                  ["03", "Build", "Implement in small, reviewable milestones with maintainable components and version control."],
                  ["04", "Audit", "Run type checks and builds, inspect the output, document changes and improve with evidence."],
                ].map(([number, title, text]) => (
                  <div key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></div>
                ))}
              </div>
            </div>
            <aside className="why-card">
              <span className="eyebrow">Why work with me</span>
              <h3>Technical curiosity grounded in business reality.</h3>
              <ul className="check-list">
                <li><Icon name="check" size={17} /> Analytical, organised and detail-oriented</li>
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
              <span className="eyebrow">Open to remote opportunities</span>
              <h2>Looking for someone who can understand data, products and business operations?</h2>
              <p>I am open to data and BI roles, web application work, SaaS collaboration, WordPress projects and practical AI-assisted initiatives.</p>
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
