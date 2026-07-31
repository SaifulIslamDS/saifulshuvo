export type HomepageStat = { value: string; label: string };
export type ProcessItem = { number: string; title: string; description: string };
export type HomepageSectionKey = "about" | "experience" | "services" | "skills" | "projects" | "insights" | "process" | "cta";
export type HomepageSectionVisibility = Record<HomepageSectionKey, boolean>;

export type HomepageContent = {
  ownerName: string;
  professionalTitle: string;
  shortBio: string;
  contactEmail: string;
  location: string;
  availability: string;
  socialLinks: Record<string, string>;
  heroEyebrow: string;
  heroHeading: string;
  heroEmphasis: string;
  heroLead: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutParagraphs: string[];
  positioningTitle: string;
  positioningPoints: string[];
  processItems: ProcessItem[];
  workPrinciples: string[];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  sectionVisibility: HomepageSectionVisibility;
  stats: HomepageStat[];
  version: number;
};

export type SkillGroupRecord = {
  id: string;
  title: string;
  icon: string;
  description?: string;
  accent: string;
  sortOrder: number;
  active: boolean;
  featured: boolean;
  skills: SkillRecord[];
};

export type SkillRecord = {
  id: string;
  groupId: string;
  name: string;
  description?: string;
  proficiency?: string;
  proficiencyLevel?: number;
  yearsExperience?: number;
  evidenceUrl?: string;
  learning: boolean;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

export type ExperienceRecord = {
  id: string;
  title: string;
  organization: string;
  employmentType?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  periodLabel?: string;
  summary: string;
  achievements: string[];
  technologies: string[];
  featured: boolean;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ServiceRecord = {
  id: string;
  title: string;
  icon: string;
  description: string;
  accent: string;
  active: boolean;
  sortOrder: number;
};
