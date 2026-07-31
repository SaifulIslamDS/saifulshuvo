import { experienceHighlights, services as staticServices, skillGroups as staticSkillGroups } from "@/data/portfolio";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ExperienceRecord, HomepageContent, HomepageSectionVisibility, ProcessItem, ServiceRecord, SkillGroupRecord, SkillRecord } from "@/types/profile";

const defaultVisibility: HomepageSectionVisibility = {
  about: true,
  experience: true,
  services: true,
  skills: true,
  projects: true,
  insights: true,
  process: true,
  cta: true,
};

const fallbackHomepage: HomepageContent = {
  ownerName: "Saiful Islam",
  professionalTitle: "Data Analyst & AI-Focused Software Builder",
  shortBio: "I combine analytics, business understanding and modern application development to build decision-ready dashboards and practical digital products.",
  contactEmail: "mail@saifulshuvo.com",
  location: "Dhaka, Bangladesh",
  availability: "Open to remote opportunities worldwide",
  socialLinks: { github: "https://github.com/SaifulIslamDS", linkedin: "https://www.linkedin.com/in/saifulislampro", website: "https://saifulshuvo.com" },
  heroEyebrow: "DATA ANALYTICS · WEB APPLICATIONS · APPLIED AI",
  heroHeading: "Turning business problems into",
  heroEmphasis: "useful digital solutions.",
  heroLead: "I combine 13+ years of professional experience, 7+ years of website development, business understanding and modern data technologies to create dashboards, applications and practical AI-assisted workflows.",
  heroPrimaryLabel: "Explore my work",
  heroPrimaryHref: "/projects",
  heroSecondaryLabel: "Discuss an opportunity",
  heroSecondaryHref: "/contact",
  aboutEyebrow: "About me",
  aboutTitle: "A multidisciplinary professional moving deeper into data and intelligent systems.",
  aboutDescription: "My advantage is not a single tool. It is the ability to connect business processes, data, users and technology to create practical outcomes.",
  aboutParagraphs: [
    "I began my development journey with HTML, CSS, JavaScript, PHP and WordPress, delivering responsive websites, customisation and digital work for local and international clients. Today, I build modern application interfaces with React, Next.js, TypeScript, Node.js, Supabase and PostgreSQL.",
    "Alongside development, I am building a professional analytics portfolio with Excel, Power BI, SQL and Python. My career direction is toward Data Analytics, Data Science, Data Engineering, Machine Learning, Deep Learning, LLMs and Agentic AI, with a focus on international remote teams and business-oriented technology products.",
  ],
  positioningTitle: "Business-aware data and software execution",
  positioningPoints: ["Analyse data and communicate decisions clearly", "Build responsive, maintainable web applications", "Translate workflows into structured digital products", "Apply LLMs and AI tools responsibly to real work"],
  processItems: [
    { number: "01", title: "Understand", description: "Clarify users, business context, available data, constraints and success criteria." },
    { number: "02", title: "Design", description: "Create a clean information architecture, workflow, requirements and technical direction." },
    { number: "03", title: "Build", description: "Implement in small, reviewable milestones with maintainable components and version control." },
    { number: "04", title: "Audit", description: "Run type checks and builds, inspect the output, document changes and improve with evidence." },
  ],
  workPrinciples: ["Analytical, organised and detail-oriented", "Comfortable across business and technology", "Strong documentation and project discipline", "Adaptable, self-driven and committed to learning", "Open to remote collaboration worldwide"],
  ctaEyebrow: "Open to remote opportunities",
  ctaTitle: "Looking for someone who can understand data, products and business operations?",
  ctaDescription: "I am open to data and BI roles, web application work, SaaS collaboration, WordPress projects and practical AI-assisted initiatives.",
  ctaPrimaryLabel: "Start a conversation",
  ctaPrimaryHref: "/contact",
  ctaSecondaryLabel: "LinkedIn profile",
  ctaSecondaryHref: "https://www.linkedin.com/in/saifulislampro",
  sectionVisibility: defaultVisibility,
  stats: [
    { value: "13+", label: "Years of professional experience" },
    { value: "7+", label: "Years in website development" },
    { value: "4", label: "End-to-end analytics projects" },
    { value: "8+", label: "Software and product initiatives" },
  ],
  version: 1,
};

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
}
function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function jsonArray<T>(value: unknown): T[] { return Array.isArray(value) ? value as T[] : []; }
function text(value: unknown, fallback = ""): string { return typeof value === "string" ? value : fallback; }

export async function getHomepageContent(): Promise<HomepageContent> {
  if (!hasSupabasePublicConfig()) return fallbackHomepage;
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", "primary").maybeSingle();
  if (error || !data) return fallbackHomepage;
  const social = object(data.social_links);
  const visibility = { ...defaultVisibility, ...object(data.homepage_section_visibility) } as HomepageSectionVisibility;
  return {
    ownerName: text(data.owner_name, fallbackHomepage.ownerName), professionalTitle: text(data.professional_title, fallbackHomepage.professionalTitle), shortBio: text(data.short_bio, fallbackHomepage.shortBio),
    contactEmail: text(data.contact_email, fallbackHomepage.contactEmail), location: text(data.location, fallbackHomepage.location), availability: text(data.availability, fallbackHomepage.availability),
    socialLinks: Object.fromEntries(Object.entries(social).filter((entry): entry is [string, string] => typeof entry[1] === "string")),
    heroEyebrow: text(data.hero_eyebrow, fallbackHomepage.heroEyebrow), heroHeading: text(data.hero_heading, fallbackHomepage.heroHeading), heroEmphasis: text(data.hero_emphasis, fallbackHomepage.heroEmphasis), heroLead: text(data.hero_lead, fallbackHomepage.heroLead),
    heroPrimaryLabel: text(data.hero_primary_label, fallbackHomepage.heroPrimaryLabel), heroPrimaryHref: text(data.hero_primary_href, fallbackHomepage.heroPrimaryHref), heroSecondaryLabel: text(data.hero_secondary_label, fallbackHomepage.heroSecondaryLabel), heroSecondaryHref: text(data.hero_secondary_href, fallbackHomepage.heroSecondaryHref),
    aboutEyebrow: text(data.about_eyebrow, fallbackHomepage.aboutEyebrow), aboutTitle: text(data.about_title, fallbackHomepage.aboutTitle), aboutDescription: text(data.about_description, fallbackHomepage.aboutDescription), aboutParagraphs: strings(data.about_paragraphs).length ? strings(data.about_paragraphs) : fallbackHomepage.aboutParagraphs,
    positioningTitle: text(data.positioning_title, fallbackHomepage.positioningTitle), positioningPoints: strings(data.positioning_points).length ? strings(data.positioning_points) : fallbackHomepage.positioningPoints,
    processItems: jsonArray<ProcessItem>(data.process_items).length ? jsonArray<ProcessItem>(data.process_items) : fallbackHomepage.processItems,
    workPrinciples: strings(data.work_principles).length ? strings(data.work_principles) : fallbackHomepage.workPrinciples,
    ctaEyebrow: text(data.cta_eyebrow, fallbackHomepage.ctaEyebrow), ctaTitle: text(data.cta_title, fallbackHomepage.ctaTitle), ctaDescription: text(data.cta_description, fallbackHomepage.ctaDescription), ctaPrimaryLabel: text(data.cta_primary_label, fallbackHomepage.ctaPrimaryLabel), ctaPrimaryHref: text(data.cta_primary_href, fallbackHomepage.ctaPrimaryHref), ctaSecondaryLabel: text(data.cta_secondary_label, fallbackHomepage.ctaSecondaryLabel), ctaSecondaryHref: text(data.cta_secondary_href, fallbackHomepage.ctaSecondaryHref),
    sectionVisibility: visibility,
    stats: jsonArray<{ value: string; label: string }>(data.homepage_stats).length ? jsonArray<{ value: string; label: string }>(data.homepage_stats) : fallbackHomepage.stats,
    version: Number(data.version ?? 1),
  };
}

function mapSkill(row: Record<string, unknown>): SkillRecord {
  return { id: String(row.id), groupId: String(row.group_id), name: text(row.name), description: text(row.description) || undefined, proficiency: text(row.proficiency) || undefined, proficiencyLevel: row.proficiency_level == null ? undefined : Number(row.proficiency_level), yearsExperience: row.years_experience == null ? undefined : Number(row.years_experience), evidenceUrl: text(row.evidence_url) || undefined, learning: Boolean(row.is_learning), featured: Boolean(row.is_featured), active: Boolean(row.is_active), sortOrder: Number(row.sort_order ?? 0) };
}
function mapGroup(row: Record<string, unknown>, skills: SkillRecord[]): SkillGroupRecord {
  return { id: String(row.id), title: text(row.title), icon: text(row.icon, "layers"), description: text(row.description) || undefined, accent: text(row.accent, "blue"), sortOrder: Number(row.sort_order ?? 0), active: Boolean(row.is_active), featured: Boolean(row.is_featured), skills: skills.filter((skill) => skill.groupId === String(row.id)).sort((a,b) => a.sortOrder-b.sortOrder) };
}

export async function getSkillGroups(options?: { admin?: boolean }): Promise<SkillGroupRecord[]> {
  if (!hasSupabasePublicConfig()) return staticSkillGroups.map((group, groupIndex) => ({ id: `static-group-${groupIndex}`, title: group.title, icon: group.icon, accent: "blue", sortOrder: groupIndex * 10, active: true, featured: true, skills: group.skills.map((name, index) => ({ id: `static-skill-${groupIndex}-${index}`, groupId: `static-group-${groupIndex}`, name, learning: name.includes("learning"), featured: index < 4, active: true, sortOrder: index * 10 })) }));
  const supabase = await createClient();
  let groupQuery = supabase.from("skill_groups").select("id,title,icon,description,accent,sort_order,is_active,is_featured").order("sort_order");
  let skillQuery = supabase.from("skills").select("id,group_id,name,description,proficiency,proficiency_level,years_experience,evidence_url,is_learning,is_featured,is_active,sort_order").order("sort_order");
  if (!options?.admin) { groupQuery = groupQuery.eq("is_active", true); skillQuery = skillQuery.eq("is_active", true); }
  const [{ data: groups, error: groupError }, { data: skillRows, error: skillError }] = await Promise.all([groupQuery, skillQuery]);
  if (groupError || skillError) { console.error(groupError?.message ?? skillError?.message); return []; }
  const mappedSkills = (skillRows ?? []).map((row: unknown) => mapSkill(row as Record<string, unknown>));
  return (groups ?? []).map((row: unknown) => mapGroup(row as Record<string, unknown>, mappedSkills));
}

function mapExperience(row: Record<string, unknown>): ExperienceRecord {
  return { id: String(row.id), title: text(row.title), organization: text(row.organization), employmentType: text(row.employment_type) || undefined, location: text(row.location) || undefined, startDate: text(row.start_date) || undefined, endDate: text(row.end_date) || undefined, current: Boolean(row.is_current), periodLabel: text(row.period_label) || undefined, summary: text(row.summary), achievements: strings(row.achievements), technologies: strings(row.technologies), featured: Boolean(row.is_featured), active: Boolean(row.is_active), sortOrder: Number(row.sort_order ?? 0), createdAt: text(row.created_at) || undefined, updatedAt: text(row.updated_at) || undefined };
}
export async function getExperienceEntries(options?: { admin?: boolean; featuredOnly?: boolean }): Promise<ExperienceRecord[]> {
  if (!hasSupabasePublicConfig()) return experienceHighlights.map((item, index) => ({ id: `static-exp-${index}`, title: item.title, organization: "Professional experience", periodLabel: item.period, summary: item.description, achievements: [], technologies: [], featured: true, active: true, current: false, sortOrder: index * 10 }));
  const supabase = await createClient();
  let query = supabase.from("experience_entries").select("*").order("sort_order").order("start_date", { ascending: false });
  if (!options?.admin) query = query.eq("is_active", true);
  if (options?.featuredOnly) query = query.eq("is_featured", true);
  const { data, error } = await query;
  if (error) { console.error("Unable to load experience:", error.message); return []; }
  return (data ?? []).map((row: unknown) => mapExperience(row as Record<string, unknown>));
}

export async function getExperienceById(id: string): Promise<ExperienceRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("experience_entries").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapExperience(data as Record<string, unknown>);
}

function mapService(row: Record<string, unknown>): ServiceRecord { return { id: String(row.id), title: text(row.title), icon: text(row.icon, "spark"), description: text(row.description), accent: text(row.accent, "blue"), active: Boolean(row.is_active), sortOrder: Number(row.sort_order ?? 0) }; }
export async function getServices(options?: { admin?: boolean }): Promise<ServiceRecord[]> {
  if (!hasSupabasePublicConfig()) return staticServices.map((item, index) => ({ id: `static-service-${index}`, title: item.title, icon: item.icon, description: item.description, accent: "blue", active: true, sortOrder: index * 10 }));
  const supabase = await createClient();
  let query = supabase.from("services").select("*").order("sort_order");
  if (!options?.admin) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) { console.error("Unable to load services:", error.message); return []; }
  return (data ?? []).map((row: unknown) => mapService(row as Record<string, unknown>));
}
