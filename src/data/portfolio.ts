export type Project = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  status: "Live" | "In development" | "Portfolio";
  featured: boolean;
  stack: string[];
  highlights: string[];
  accent: string;
};

export const primarySkills = [
  "Python",
  "SQL",
  "Power BI",
  "Excel",
  "Data Analytics",
  "React",
  "Next.js",
  "Node.js",
  "Supabase",
  "PostgreSQL",
];

export const skillGroups = [
  {
    title: "Data & Analytics",
    icon: "chart",
    skills: [
      "Excel",
      "Power BI",
      "SQL",
      "Python",
      "Data Analytics",
      "Business Intelligence",
      "Financial Analysis",
      "Data Storytelling",
    ],
  },
  {
    title: "AI & Emerging Tech",
    icon: "brain",
    skills: [
      "Prompt Engineering",
      "Large Language Models",
      "Generative AI",
      "AI-assisted Development",
      "Machine Learning — learning",
      "Agentic AI — learning",
    ],
  },
  {
    title: "Web & Application Development",
    icon: "code",
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "PHP",
      "WordPress",
      "Supabase",
    ],
  },
  {
    title: "Business & Operations",
    icon: "briefcase",
    skills: [
      "Project Management",
      "Accounting",
      "QuickBooks",
      "Xero",
      "FreshBooks",
      "Administrative Operations",
      "Human Resource Management",
    ],
  },
  {
    title: "Marketing & Creative",
    icon: "spark",
    skills: [
      "Digital Marketing",
      "Social Media Marketing",
      "SEO",
      "Email Template Design",
      "Photoshop",
      "Illustrator",
      "Canva",
    ],
  },
  {
    title: "Professional Strengths",
    icon: "user",
    skills: [
      "Analytical Thinking",
      "Adaptability",
      "Fast Learning",
      "Education & Mentoring",
      "Communication",
      "Cross-functional Collaboration",
    ],
  },
];

export const services = [
  {
    icon: "chart",
    title: "Data Analytics & BI",
    description:
      "Transforming raw business data into clear dashboards, KPIs, insights and decision-ready reports.",
  },
  {
    icon: "code",
    title: "Web & Portfolio Development",
    description:
      "Responsive websites and application interfaces built with modern, maintainable frontend technologies.",
  },
  {
    icon: "layers",
    title: "SaaS Product Development",
    description:
      "Planning and building practical software products from idea, workflow and UX through deployment.",
  },
  {
    icon: "brain",
    title: "AI-Assisted Solutions",
    description:
      "Applying prompt engineering, LLM workflows and automation to improve real business processes.",
  },
  {
    icon: "search",
    title: "SEO & Digital Growth",
    description:
      "Search-friendly content structures, digital campaign support and practical online visibility improvements.",
  },
  {
    icon: "briefcase",
    title: "Business Operations",
    description:
      "Combining accounting, administration and project management knowledge with technology execution.",
  },
];

export const projects: Project[] = [
  {
    slug: "insightreport",
    title: "InsightReport",
    category: "Analytics SaaS",
    summary:
      "A CSV/XLSX analytics workflow that turns uploaded business data into quality checks, insights, decisions and reports.",
    description:
      "InsightReport is a full-stack analytics product concept built around secure uploads, profiling, cleaning, semantic models, analytics, recommendations and evidence-backed reporting.",
    status: "In development",
    featured: true,
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Netlify"],
    highlights: [
      "Secure owner-scoped analytics workflow",
      "Data profiling and cleaning studio",
      "KPI, insight and reporting architecture",
    ],
    accent: "cyan",
  },
  {
    slug: "promptkarigor",
    title: "PromptKarigor",
    category: "AI Productivity",
    summary:
      "A practical prompt-generation product that helps users create structured prompts for professional work.",
    description:
      "PromptKarigor grew from a personal prompt helper into a polished full-stack web application focused on making prompt creation simpler and more useful.",
    status: "Live",
    featured: true,
    stack: ["React", "TypeScript", "Supabase", "Netlify", "LLM Workflows"],
    highlights: [
      "Guided prompt-building experience",
      "Professional reusable prompt structures",
      "Production deployment with custom domain",
    ],
    accent: "violet",
  },
  {
    slug: "hsf-erp",
    title: "HSF ERP",
    category: "Operations Platform",
    summary:
      "An ERP concept for NGO operations covering people, projects, procurement, finance, healthcare and education workflows.",
    description:
      "HSF ERP is designed around the real operational requirements of Human Safety Foundation, including multi-project financial and administrative processes.",
    status: "In development",
    featured: true,
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "pnpm"],
    highlights: [
      "Role-based operational workflows",
      "Project and finance process modelling",
      "Responsive staff-facing interface",
    ],
    accent: "green",
  },
  {
    slug: "data-analytics-portfolio",
    title: "Data Analytics Portfolio",
    category: "Analytics Case Studies",
    summary:
      "Four business-focused projects using Excel, SQL, Python and Power BI to demonstrate end-to-end analytical thinking.",
    description:
      "The portfolio includes retail profitability, financial transactions, marketing campaign analysis and HR attrition reporting.",
    status: "Portfolio",
    featured: true,
    stack: ["Excel", "Power BI", "PostgreSQL", "Python", "Pandas"],
    highlights: [
      "Business problem definition and cleaning",
      "KPI dashboards and analytical queries",
      "Actionable insights and case-study documentation",
    ],
    accent: "blue",
  },
  {
    slug: "ayatfinder",
    title: "AyatFinder",
    category: "Knowledge Application",
    summary:
      "A scalable Quran search application concept designed to help users discover relevant verses by subject.",
    description:
      "AyatFinder uses verified local Quran data and Supabase search, with a roadmap toward contextual and AI-assisted discovery.",
    status: "In development",
    featured: false,
    stack: ["Next.js", "Supabase", "PostgreSQL", "pnpm"],
    highlights: ["Verified local data import", "Search-focused architecture", "Scalable roadmap"],
    accent: "green",
  },
  {
    slug: "qc-bondhu-ai",
    title: "QC Bondhu AI",
    category: "Garments Workflow App",
    summary:
      "A Bengali-friendly quality reporting interface for creating professional English QC reports and emails quickly.",
    description:
      "QC Bondhu AI combines garments domain knowledge with simplified input, selectable defects and AI-assisted English output.",
    status: "In development",
    featured: false,
    stack: ["React", "AI Workflows", "Vercel", "Responsive UI"],
    highlights: ["Bengali-friendly workflow", "QC report generation", "Garments industry context"],
    accent: "orange",
  },
];

export const articles = [
  {
    slug: "from-data-to-intelligent-products",
    title: "From Data Analysis to Intelligent Products",
    excerpt:
      "How analytics, product thinking and AI-assisted development can work together to solve practical business problems.",
    category: "Career Journey",
    date: "Coming soon",
    readTime: "6 min read",
  },
  {
    slug: "building-saas-with-ai-coding-tools",
    title: "Building SaaS Products with AI Coding Tools",
    excerpt:
      "A practical reflection on planning, iteration, auditing and shipping software with modern AI development workflows.",
    category: "SaaS Development",
    date: "Coming soon",
    readTime: "8 min read",
  },
  {
    slug: "business-first-data-analytics",
    title: "Business-First Data Analytics",
    excerpt:
      "Why dashboards become more useful when the analyst starts with decisions, operations and stakeholder questions.",
    category: "Data Analytics",
    date: "Coming soon",
    readTime: "5 min read",
  },
];
