export type Project = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  status: "Live" | "In development" | "Portfolio" | "Deployed";
  featured: boolean;
  stack: string[];
  highlights: string[];
  accent: string;
  role: string;
  sourceUrl?: string;
  liveUrl?: string;
};

export const primarySkills = [
  "Excel",
  "Power BI",
  "SQL",
  "Python",
  "Data Analytics",
  "React",
  "Next.js",
  "TypeScript",
  "Supabase",
  "PostgreSQL",
];

export const skillGroups = [
  {
    title: "Data Analytics & BI",
    icon: "chart",
    skills: [
      "Microsoft Excel",
      "Power Query",
      "Power Pivot",
      "Power BI",
      "DAX",
      "SQL",
      "PostgreSQL",
      "Python",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Jupyter Notebook",
      "Data Cleaning",
      "Dashboard Development",
      "KPI Analysis",
      "Data Storytelling",
    ],
  },
  {
    title: "AI & Emerging Technologies",
    icon: "brain",
    skills: [
      "Prompt Engineering",
      "Large Language Models",
      "Generative AI",
      "AI-assisted Development",
      "Workflow Automation",
      "Machine Learning — learning",
      "Deep Learning — learning",
      "Data Engineering — learning",
      "Agentic AI — learning",
    ],
  },
  {
    title: "Frontend & Application Development",
    icon: "code",
    skills: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Responsive Web Design",
      "UI Development",
      "Cross-browser Compatibility",
    ],
  },
  {
    title: "Backend, Database & CMS",
    icon: "layers",
    skills: [
      "Node.js",
      "PHP",
      "Laravel",
      "REST APIs",
      "PostgreSQL",
      "MySQL",
      "Supabase",
      "Authentication",
      "Role-based Access Control",
      "WordPress Development",
      "Theme Customisation",
      "WooCommerce",
    ],
  },
  {
    title: "Business, Finance & Operations",
    icon: "briefcase",
    skills: [
      "Project Management",
      "Accounting",
      "Financial Analysis",
      "QuickBooks",
      "Xero",
      "FreshBooks",
      "Administrative Operations",
      "Human Resource Management",
      "Business Process Analysis",
    ],
  },
  {
    title: "Marketing, Design & Communication",
    icon: "spark",
    skills: [
      "Digital Marketing",
      "Social Media Marketing",
      "SEO",
      "Email Template Design",
      "Lead Generation",
      "Photoshop",
      "Illustrator",
      "Canva",
      "Word Processing",
      "Slide Presentation",
      "Education & Mentoring",
    ],
  },
];

export const services = [
  {
    icon: "chart",
    title: "Data Analytics & BI",
    description:
      "Clean, analyse and communicate business data through Excel, SQL, Python, Power BI dashboards, KPIs and decision-ready reports.",
  },
  {
    icon: "code",
    title: "Web & Application Development",
    description:
      "Build responsive websites, portfolios, landing pages and database-driven interfaces with modern frontend and backend technologies.",
  },
  {
    icon: "layers",
    title: "SaaS & Business Systems",
    description:
      "Translate real operational requirements into structured product scopes, admin dashboards, ERP workflows and maintainable application releases.",
  },
  {
    icon: "brain",
    title: "AI-Assisted Solutions",
    description:
      "Apply prompt engineering, LLM workflows and AI-assisted development to content, reporting, automation and practical business processes.",
  },
  {
    icon: "search",
    title: "WordPress, SEO & Digital Growth",
    description:
      "Develop and customise WordPress websites while improving technical structure, search visibility, landing pages and digital campaign support.",
  },
  {
    icon: "briefcase",
    title: "Business & Project Operations",
    description:
      "Support projects with accounting knowledge, documentation, administration, HR understanding, process mapping and disciplined delivery.",
  },
];

export const experienceHighlights = [
  {
    period: "13+ years",
    title: "Professional and industry experience",
    description:
      "A long practical foundation across garments, business operations, administration, project work, finance-related tasks and client service.",
  },
  {
    period: "7+ years",
    title: "Website development experience",
    description:
      "Hands-on delivery of responsive websites, WordPress projects, customisation, maintenance, landing pages and client-facing digital work.",
  },
  {
    period: "Current",
    title: "Data analytics and BI portfolio",
    description:
      "Business-focused case studies using Excel, Power BI, PostgreSQL, SQL, Python, Pandas and documented analytical storytelling.",
  },
  {
    period: "Growing",
    title: "Full-stack, SaaS and applied AI",
    description:
      "Building modern applications with Next.js, TypeScript, Supabase and structured AI-assisted planning, testing and release workflows.",
  },
];

export const projects: Project[] = [
  {
    slug: "data-analytics-portfolio",
    title: "Data Analytics Portfolio",
    category: "Analytics & Business Intelligence",
    summary:
      "Four end-to-end business case studies using Excel, SQL, Python and Power BI with cleaning, KPIs, dashboards and written recommendations.",
    description:
      "This portfolio demonstrates business-first analytical thinking across retail profitability, financial transactions, marketing campaign performance and HR attrition. Each project includes data preparation, analysis, visualisation and a documented case study.",
    status: "Portfolio",
    featured: true,
    stack: ["Excel", "Power BI", "PostgreSQL", "Python", "Pandas", "DAX"],
    highlights: [
      "Retail sales and profitability dashboard in Excel",
      "100,000-row financial transaction analysis in PostgreSQL",
      "Python marketing campaign EDA with business insights",
      "Power BI HR attrition and retention dashboard",
    ],
    accent: "blue",
    role: "Data cleaning, analysis, dashboard development, insight writing and case-study documentation",
    sourceUrl: "https://github.com/SaifulIslamDS/data-analytics-portfolio",
  },
  {
    slug: "promptkarigor",
    title: "PromptKarigor",
    category: "AI Productivity Application",
    summary:
      "A structured prompt-building and prompt-management application that helps users create, organise, improve and reuse professional prompts.",
    description:
      "PromptKarigor began as a simple personal prompt generator and evolved through repeated planning, implementation, trial, error and refinement into a production-deployed full-stack application with structured workflows and multilingual product direction.",
    status: "Live",
    featured: true,
    stack: ["React", "TypeScript", "Supabase", "Netlify", "Prompt Engineering"],
    highlights: [
      "Guided and reusable prompt-building workflow",
      "Authentication and content-management direction",
      "Versioned development and release discipline",
      "Production deployment with a custom domain and HTTPS",
    ],
    accent: "violet",
    role: "Product idea, requirements, UX direction, implementation workflow, testing and release management",
    liveUrl: "https://promptkarigor.xyz",
  },
  {
    slug: "insightreport",
    title: "InsightReport",
    category: "Data Analytics SaaS",
    summary:
      "A secure CSV/XLSX analytics workflow that turns uploaded business data into quality checks, cleaning recipes, insights, decisions and evidence-backed reports.",
    description:
      "InsightReport is a full-stack analytics product designed around owner-scoped projects and reproducible analytical lineage. Its roadmap covers upload validation, profiling, cleaning, semantic modelling, KPI analysis, insights, recommendations and versioned reporting.",
    status: "In development",
    featured: true,
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Netlify"],
    highlights: [
      "Secure owner-scoped analytics workflow",
      "Profiling and data-quality assessment",
      "Cleaning studio and semantic KPI registry",
      "Insight, recommendation and evidence-report architecture",
    ],
    accent: "cyan",
    role: "Product architecture, analytics workflow design, UI direction, development auditing and release planning",
  },
  {
    slug: "hsf-erp",
    title: "HSF ERP",
    category: "NGO Operations Platform",
    summary:
      "A role-based operational system designed around the real finance, HR, procurement, education and healthcare workflows of Human Safety Foundation.",
    description:
      "HSF ERP models multi-project NGO operations, including monthly financial requests, approvals, procurement, salaries, field disbursement, education records, medical-camp activity and management reporting.",
    status: "In development",
    featured: true,
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "pnpm"],
    highlights: [
      "Real NGO programme and financial workflow modelling",
      "Role-based staff and approval structure",
      "Education, healthcare, procurement and finance scope",
      "Responsive staff-facing interface direction",
    ],
    accent: "green",
    role: "Requirements analysis, process modelling, product planning, UI direction and development workflow",
  },
  {
    slug: "ayatfinder",
    title: "AyatFinder",
    category: "Qur’an Knowledge Application",
    summary:
      "A subject-based Qur’an verse discovery application designed to help users find relevant guidance through verified local data and scalable search.",
    description:
      "AyatFinder focuses on trustworthy Qur’an data, local import verification, Supabase-powered search and a roadmap toward Bengali and English subject discovery with carefully bounded AI assistance.",
    status: "In development",
    featured: false,
    stack: ["Next.js", "Supabase", "PostgreSQL", "pnpm"],
    highlights: [
      "Verified local Qur’an data import",
      "Subject-based search architecture",
      "Bengali and English product direction",
      "Future contextual and AI-assisted discovery",
    ],
    accent: "green",
    role: "Product concept, data workflow, architecture, quality verification and release planning",
  },
  {
    slug: "qc-bondhu-ai",
    title: "QC Bondhu AI",
    category: "Garments Quality Workflow",
    summary:
      "A Bengali-friendly quality-control application that converts simple defect selection or voice input into professional English QC reports and emails.",
    description:
      "QC Bondhu AI applies garments-domain understanding to a short operational flow: garment type, inspection type, basic information, defect selection or Bengali voice input, then a professional report and email output.",
    status: "In development",
    featured: false,
    stack: ["React", "Responsive UI", "AI Workflows", "Vercel"],
    highlights: [
      "Bengali-first workflow for garments professionals",
      "Selectable defects and voice-input direction",
      "Professional English QC report generation",
      "Email-ready operational output",
    ],
    accent: "orange",
    role: "Domain workflow design, product planning, UI simplification and AI-output structure",
  },
  {
    slug: "edunexa",
    title: "EduNexa",
    category: "School Management Application",
    summary:
      "A scalable multi-school management concept supporting institutions from primary school through university with modular academic workflows.",
    description:
      "EduNexa explores a modular architecture for institutional data, users, students, academic records and optional attendance while maintaining a professional pnpm monorepo and deployment workflow.",
    status: "Deployed",
    featured: false,
    stack: ["Next.js", "pnpm", "Monorepo", "Netlify"],
    highlights: [
      "Multi-school product direction",
      "Primary-to-university scalability goal",
      "Modern monorepo structure",
      "Netlify deployment workflow",
    ],
    accent: "blue",
    role: "Product scope, architecture direction, setup troubleshooting and deployment guidance",
  },
  {
    slug: "nexora-erp",
    title: "Nexora ERP",
    category: "SME ERP Architecture",
    summary:
      "A modular ERP foundation for small and medium businesses using a modern TypeScript monorepo and domain-oriented application structure.",
    description:
      "Nexora ERP was structured as a Next.js and NestJS monorepo with shared domain, contracts and UI packages, supported by PostgreSQL, Prisma, pnpm and release-oriented repository practices.",
    status: "In development",
    featured: false,
    stack: ["Next.js", "NestJS", "TypeScript", "Prisma", "PostgreSQL", "Turborepo"],
    highlights: [
      "Shared domain, contracts and UI packages",
      "Type-safe frontend and backend direction",
      "ERP module roadmap and deployment exploration",
      "Structured linting and type-check workflow",
    ],
    accent: "violet",
    role: "Architecture planning, repository setup, technical troubleshooting and release workflow",
  },
];

export const articles = [
  {
    slug: "from-data-to-intelligent-products",
    title: "From Data Analysis to Intelligent Products",
    excerpt:
      "How analytics, business understanding, product thinking and AI-assisted development can work together to solve practical problems.",
    category: "Career Journey",
    date: "Planned article",
    readTime: "6 min read",
  },
  {
    slug: "building-products-with-ai-coding-tools",
    title: "Building Products with AI Coding Tools",
    excerpt:
      "A practical reflection on separating planning from implementation, developing in milestones, auditing code and releasing software responsibly.",
    category: "SaaS Development",
    date: "Planned article",
    readTime: "8 min read",
  },
  {
    slug: "business-first-data-analytics",
    title: "Business-First Data Analytics",
    excerpt:
      "Why dashboards and reports become more useful when analysis begins with decisions, operations, stakeholders and measurable questions.",
    category: "Data Analytics",
    date: "Planned article",
    readTime: "5 min read",
  },
];
