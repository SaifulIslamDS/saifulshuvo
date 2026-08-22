import { cache } from "react";
import { allowWordPressFallback } from "@/lib/wordpress/env";
import { choice, numberValue, repeatText, stripHtml, text } from "@/lib/wordpress/helpers";
import { wpGraphql } from "@/lib/wordpress/client";
import { getSiteSettingsFields } from "@/lib/wordpress/queries/site-settings";
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

export const fallbackHomepage: HomepageContent = {
  ownerName: "Saiful Shuvo",
  professionalTitle: "Data Analyst & AI-Focused Software Builder",
  shortBio: "I combine analytics, business understanding and modern application development to build decision-ready dashboards and practical digital products.",
  contactEmail: "mail@saifulshuvo.com",
  location: "Dhaka, Bangladesh",
  availability: "Open to remote opportunities worldwide",
  socialLinks: { github: "https://github.com/SaifulIslamDS", linkedin: "https://www.linkedin.com/in/saifulislampro", website: "https://saifulshuvo.com" },
  heroEyebrow: "DATA ANALYTICS · WEB APPLICATIONS · APPLIED AI",
  heroHeading: "Turning business problems into",
  heroEmphasis: "useful digital solutions.",
  heroLead: "I combine professional experience, business understanding and modern data technologies to create dashboards, applications and practical AI-assisted workflows.",
  heroPrimaryLabel: "Explore my work",
  heroPrimaryHref: "/projects",
  heroSecondaryLabel: "Discuss an opportunity",
  heroSecondaryHref: "/contact",
  aboutEyebrow: "About me",
  aboutTitle: "A multidisciplinary professional moving deeper into data and intelligent systems.",
  aboutDescription: "My advantage is the ability to connect business processes, data, users and technology to create practical outcomes.",
  aboutParagraphs: [],
  positioningTitle: "Business-aware data and software execution",
  positioningPoints: [],
  processItems: [],
  workPrinciples: [],
  ctaEyebrow: "Open to remote opportunities",
  ctaTitle: "Looking for someone who can understand data, products and business operations?",
  ctaDescription: "I am open to data and BI roles, web application work, SaaS collaboration, WordPress projects and practical AI-assisted initiatives.",
  ctaPrimaryLabel: "Start a conversation",
  ctaPrimaryHref: "/contact",
  ctaSecondaryLabel: "LinkedIn profile",
  ctaSecondaryHref: "https://www.linkedin.com/in/saifulislampro",
  sectionVisibility: defaultVisibility,
  stats: [],
  version: 1,
};

export const getHomepageContent = cache(async (): Promise<HomepageContent> => {
  try {
    const fields = await getSiteSettingsFields();
    const paragraphs = repeatText(fields.aboutParagraphs);
    const positioningPoints = repeatText(fields.positioningPoints);
    const workPrinciples = repeatText(fields.workPrinciples);
    const processItems: ProcessItem[] = Array.isArray(fields.processItems)
      ? fields.processItems
        .map((item) => ({ number: text(item.number), title: text(item.title), description: text(item.description) }))
        .filter((item) => item.number || item.title || item.description)
      : [];
    const stats = Array.isArray(fields.homepageStats)
      ? fields.homepageStats
        .map((item) => ({ value: text(item.value), label: text(item.label) }))
        .filter((item) => item.value || item.label)
      : [];

    return {
      ownerName: text(fields.ownerName, fallbackHomepage.ownerName),
      professionalTitle: text(fields.professionalTitle, fallbackHomepage.professionalTitle),
      shortBio: text(fields.shortBio, fallbackHomepage.shortBio),
      contactEmail: text(fields.contactEmail, fallbackHomepage.contactEmail),
      location: text(fields.location, fallbackHomepage.location),
      availability: text(fields.availability, fallbackHomepage.availability),
      socialLinks: {
        github: text(fields.github),
        linkedin: text(fields.linkedin),
        facebook: text(fields.facebook),
        website: text(fields.website),
      },
      heroEyebrow: text(fields.heroEyebrow, fallbackHomepage.heroEyebrow),
      heroHeading: text(fields.heroHeading, fallbackHomepage.heroHeading),
      heroEmphasis: text(fields.heroEmphasis, fallbackHomepage.heroEmphasis),
      heroLead: text(fields.heroLead, fallbackHomepage.heroLead),
      heroPrimaryLabel: text(fields.heroPrimaryLabel, fallbackHomepage.heroPrimaryLabel),
      heroPrimaryHref: text(fields.heroPrimaryHref, fallbackHomepage.heroPrimaryHref),
      heroSecondaryLabel: text(fields.heroSecondaryLabel, fallbackHomepage.heroSecondaryLabel),
      heroSecondaryHref: text(fields.heroSecondaryHref, fallbackHomepage.heroSecondaryHref),
      aboutEyebrow: text(fields.aboutEyebrow, fallbackHomepage.aboutEyebrow),
      aboutTitle: text(fields.aboutTitle, fallbackHomepage.aboutTitle),
      aboutDescription: text(fields.aboutDescription, fallbackHomepage.aboutDescription),
      aboutParagraphs: paragraphs.length ? paragraphs : fallbackHomepage.aboutParagraphs,
      positioningTitle: text(fields.positioningTitle, fallbackHomepage.positioningTitle),
      positioningPoints: positioningPoints.length ? positioningPoints : fallbackHomepage.positioningPoints,
      processItems: processItems.length ? processItems : fallbackHomepage.processItems,
      workPrinciples: workPrinciples.length ? workPrinciples : fallbackHomepage.workPrinciples,
      ctaEyebrow: text(fields.ctaEyebrow, fallbackHomepage.ctaEyebrow),
      ctaTitle: text(fields.ctaTitle, fallbackHomepage.ctaTitle),
      ctaDescription: text(fields.ctaDescription, fallbackHomepage.ctaDescription),
      ctaPrimaryLabel: text(fields.ctaPrimaryLabel, fallbackHomepage.ctaPrimaryLabel),
      ctaPrimaryHref: text(fields.ctaPrimaryHref, fallbackHomepage.ctaPrimaryHref),
      ctaSecondaryLabel: text(fields.ctaSecondaryLabel, fallbackHomepage.ctaSecondaryLabel),
      ctaSecondaryHref: text(fields.ctaSecondaryHref, fallbackHomepage.ctaSecondaryHref),
      sectionVisibility: {
        about: fields.showAbout ?? true,
        experience: fields.showExperience ?? true,
        services: fields.showServices ?? true,
        skills: fields.showSkills ?? true,
        projects: fields.showProjects ?? true,
        insights: fields.showBlog ?? true,
        process: fields.showProcess ?? true,
        cta: fields.showCta ?? true,
      },
      stats,
      version: 1,
    };
  } catch (error) {
    if (allowWordPressFallback()) return fallbackHomepage;
    throw error;
  }
});

type SkillNode = {
  id: string;
  slug?: string | null;
  title?: string | null;
  content?: string | null;
  skillGroups?: { nodes?: Array<{
    id: string;
    name?: string | null;
    slug?: string | null;
    description?: string | null;
    skillGroupFields?: {
      icon?: string[] | string | null;
      accent?: string[] | string | null;
      sortOrder?: number | null;
      active?: boolean | null;
      featured?: boolean | null;
    } | null;
  }> | null } | null;
  skillFields?: {
    description?: string | null;
    proficiencyLabel?: string | null;
    proficiencyLevel?: number | null;
    yearsExperience?: number | null;
    evidenceUrl?: string | null;
    learning?: boolean | null;
    featured?: boolean | null;
    active?: boolean | null;
    sortOrder?: number | null;
  } | null;
};

type SkillsQuery = { skills?: { nodes?: SkillNode[] | null } | null };

const SKILLS_QUERY = `
  query SaifulShuvoSkills {
    skills(first: 100) {
      nodes {
        id
        slug
        title
        content
        skillGroups(first: 10) {
          nodes {
            id
            name
            slug
            description
            skillGroupFields { icon accent sortOrder active featured }
          }
        }
        skillFields {
          description
          proficiencyLabel
          proficiencyLevel
          yearsExperience
          evidenceUrl
          learning
          featured
          active
          sortOrder
        }
      }
    }
  }
`;

export const getSkillGroups = cache(async (_options?: { admin?: boolean }): Promise<SkillGroupRecord[]> => {
  const data = await wpGraphql<SkillsQuery>(SKILLS_QUERY);
  const groups = new Map<string, SkillGroupRecord>();

  for (const node of data.skills?.nodes ?? []) {
    const term = node.skillGroups?.nodes?.[0];
    if (!term) continue;
    const groupId = term.id;
    const groupFields = term.skillGroupFields;
    if (!groups.has(groupId)) {
      groups.set(groupId, {
        id: groupId,
        title: text(term.name),
        icon: choice(groupFields?.icon, "layers"),
        description: text(term.description) || undefined,
        accent: choice(groupFields?.accent, "blue"),
        sortOrder: numberValue(groupFields?.sortOrder),
        active: groupFields?.active ?? true,
        featured: groupFields?.featured ?? true,
        skills: [],
      });
    }
    const skillFields = node.skillFields;
    const skill: SkillRecord = {
      id: node.id,
      groupId,
      name: text(node.title),
      description: text(skillFields?.description) || stripHtml(text(node.content)) || undefined,
      proficiency: text(skillFields?.proficiencyLabel) || undefined,
      proficiencyLevel: skillFields?.proficiencyLevel == null ? undefined : numberValue(skillFields.proficiencyLevel),
      yearsExperience: skillFields?.yearsExperience == null ? undefined : numberValue(skillFields.yearsExperience),
      evidenceUrl: text(skillFields?.evidenceUrl) || undefined,
      learning: skillFields?.learning ?? false,
      featured: skillFields?.featured ?? false,
      active: skillFields?.active ?? true,
      sortOrder: numberValue(skillFields?.sortOrder),
    };
    groups.get(groupId)?.skills.push(skill);
  }

  return [...groups.values()]
    .map((group) => ({ ...group, skills: group.skills.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)) }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
});

type ExperienceNode = {
  id: string;
  title?: string | null;
  content?: string | null;
  date?: string | null;
  modified?: string | null;
  technologies?: { nodes?: Array<{ id: string; name?: string | null; slug?: string | null }> | null } | null;
  experienceFields?: {
    organization?: string | null;
    employmentType?: string | null;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    currentlyWorking?: boolean | null;
    periodLabel?: string | null;
    summary?: string | null;
    achievements?: Array<{ text?: string | null }> | null;
    featured?: boolean | null;
    active?: boolean | null;
    sortOrder?: number | null;
  } | null;
};

type ExperiencesQuery = { experiences?: { nodes?: ExperienceNode[] | null } | null };

const EXPERIENCES_QUERY = `
  query SaifulShuvoExperiences {
    experiences(first: 100) {
      nodes {
        id
        title
        content
        date
        modified
        technologies(first: 50) { nodes { id name slug } }
        experienceFields {
          organization
          employmentType
          location
          startDate
          endDate
          currentlyWorking
          periodLabel
          summary
          achievements { text }
          featured
          active
          sortOrder
        }
      }
    }
  }
`;

export const getExperienceEntries = cache(async (options?: { featuredOnly?: boolean }): Promise<ExperienceRecord[]> => {
  const data = await wpGraphql<ExperiencesQuery>(EXPERIENCES_QUERY);
  let records: ExperienceRecord[] = (data.experiences?.nodes ?? []).map((node) => {
    const fields = node.experienceFields;
    return {
      id: node.id,
      title: text(node.title),
      organization: text(fields?.organization),
      employmentType: text(fields?.employmentType) || undefined,
      location: text(fields?.location) || undefined,
      startDate: text(fields?.startDate) || undefined,
      endDate: text(fields?.endDate) || undefined,
      current: fields?.currentlyWorking ?? false,
      periodLabel: text(fields?.periodLabel) || undefined,
      summary: text(fields?.summary) || stripHtml(text(node.content)),
      achievements: repeatText(fields?.achievements),
      technologies: (node.technologies?.nodes ?? []).map((term) => text(term.name)).filter(Boolean),
      featured: fields?.featured ?? true,
      active: fields?.active ?? true,
      sortOrder: numberValue(fields?.sortOrder),
      createdAt: node.date || undefined,
      updatedAt: node.modified || undefined,
    };
  });
  records = records.filter((record) => record.active);
  if (options?.featuredOnly) records = records.filter((record) => record.featured);
  return records.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
});

export async function getExperienceEntryById(id: string): Promise<ExperienceRecord | null> {
  const records = await getExperienceEntries();
  return records.find((record) => record.id === id) ?? null;
}

type ServiceNode = {
  id: string;
  title?: string | null;
  content?: string | null;
  excerpt?: string | null;
  serviceFields?: {
    icon?: string[] | string | null;
    accent?: string[] | string | null;
    active?: boolean | null;
    sortOrder?: number | null;
  } | null;
};

type ServicesQuery = { services?: { nodes?: ServiceNode[] | null } | null };

const SERVICES_QUERY = `
  query SaifulShuvoServices {
    services(first: 100) {
      nodes {
        id
        title
        content
        excerpt
        serviceFields { icon accent active sortOrder }
      }
    }
  }
`;

export const getServices = cache(async (): Promise<ServiceRecord[]> => {
  const data = await wpGraphql<ServicesQuery>(SERVICES_QUERY);
  return (data.services?.nodes ?? [])
    .map((node): ServiceRecord => ({
      id: node.id,
      title: text(node.title),
      icon: choice(node.serviceFields?.icon, "spark"),
      description: stripHtml(text(node.content)) || stripHtml(text(node.excerpt)),
      accent: choice(node.serviceFields?.accent, "blue"),
      active: node.serviceFields?.active ?? true,
      sortOrder: numberValue(node.serviceFields?.sortOrder),
    }))
    .filter((service) => service.active)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
});
