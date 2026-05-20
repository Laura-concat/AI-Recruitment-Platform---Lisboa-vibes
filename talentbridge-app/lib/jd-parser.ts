// Job Description text parsing — extracts title, required skills, and experience requirements

export interface ParsedJob {
  title: string | null;
  requiredSkills: string[];
  experienceYears: number | null;
  description: string;
}

// ─── Title extraction ──────────────────────────────────────────────────────────

export function extractJobTitle(text: string): string | null {
  const lines = text
    .split(/[\n\r]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Common job title patterns
  const titleIndicators = /\b(developer|engineer|designer|architect|manager|analyst|scientist|lead|head|director|specialist|consultant|coordinator|officer|administrator)\b/i;

  for (const line of lines.slice(0, 10)) {
    // Skip lines that are clearly metadata (company name, location, etc.)
    if (/\b(we are|we're|about us|company|location:|city:|salary:|type:|remote|full.?time|part.?time|contract)\b/i.test(line)) continue;
    // Skip very short or very long lines
    if (line.length < 5 || line.length > 100) continue;
    // Lines that look like job titles
    if (titleIndicators.test(line) || /^(senior|junior|mid|lead|principal|staff)\s/i.test(line)) {
      return line.slice(0, 100).trim();
    }
  }

  // Fallback: first short line that doesn't look like a header
  for (const line of lines.slice(0, 5)) {
    if (line.length >= 5 && line.length <= 80 && !/^(job|role|position|about|overview)\s*:/i.test(line)) {
      return line.slice(0, 100).trim();
    }
  }

  return null;
}

// ─── Experience years extraction ───────────────────────────────────────────────

export function extractRequiredYears(text: string): number | null {
  const patterns = [
    /(\d+)\+?\s*(?:–|-|to)\s*(\d+)\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?experience/i,
    /minimum\s+(?:of\s+)?(\d+)\+?\s*years?\s+(?:of\s+)?experience/i,
    /at\s+least\s+(\d+)\+?\s*years?\s+(?:of\s+)?experience/i,
    /(\d+)\+\s*years?\s+(?:of\s+)?(?:professional\s+)?experience/i,
    /(\d+)\+?\s*years?\s+of\s+(?:relevant\s+)?(?:professional\s+)?experience/i,
    /experience[:\s]+(\d+)\+?\s*years?/i,
    /(\d+)\s*years?\s+(?:minimum|required|needed)/i,
  ];

  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      // For range patterns (e.g. "3–5 years"), take the lower bound
      return parseInt(m[1], 10);
    }
  }
  return null;
}

// ─── Skills extraction (shared dictionary with cv-parser) ──────────────────────

const TECH_SKILLS = new Set([
  "javascript","typescript","python","java","c#","c++","c","go","rust","ruby","php","swift","kotlin",
  "scala","r","matlab","bash","shell","powershell","sql","html","css","html5","css3","sass","scss","less",
  "react","next.js","nextjs","vue","vue.js","vuejs","angular","svelte","nuxt","remix","gatsby","vite",
  "webpack","babel","tailwind","tailwindcss","bootstrap","material-ui","mui","styled-components","jquery",
  "redux","zustand","mobx","recoil","jotai","react-query","tanstack-query","graphql","apollo",
  "node.js","nodejs","express","fastify","nestjs","django","flask","fastapi","spring","spring boot",
  "rails","laravel","symfony","asp.net","dotnet",".net","grpc","rest","restful api","microservices",
  "postgresql","postgres","mysql","sqlite","mongodb","redis","elasticsearch","cassandra","dynamodb",
  "firebase","supabase","neon","planetscale","drizzle","prisma","sequelize","typeorm","hibernate",
  "aws","azure","gcp","google cloud","docker","kubernetes","k8s","terraform","ansible","jenkins",
  "github actions","gitlab ci","circleci","vercel","netlify","heroku","linux","nginx","apache",
  "git","github","gitlab","jira","figma","postman","swagger","websockets","kafka",
  "rabbitmq","celery","airflow","spark","hadoop","pytorch","tensorflow","scikit-learn","pandas",
  "numpy","openai","langchain","stripe","clerk","auth0",
  "react native","flutter","ios","android","expo",
  "jest","vitest","playwright","cypress","selenium","pytest","junit","mocha","chai",
  "jwt","oauth","rbac","rag","vector","llm","cuda",
]);

const SKILL_DISPLAY: Record<string, string> = {
  "javascript": "JavaScript", "typescript": "TypeScript", "python": "Python", "java": "Java",
  "c#": "C#", "c++": "C++", "c": "C", "go": "Go", "rust": "Rust", "ruby": "Ruby",
  "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "mongodb": "MongoDB", "redis": "Redis",
  "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes", "aws": "AWS", "azure": "Azure",
  "gcp": "GCP", "google cloud": "Google Cloud", "graphql": "GraphQL",
  "react": "React", "next.js": "Next.js", "nextjs": "Next.js",
  "vue": "Vue.js", "vue.js": "Vue.js", "vuejs": "Vue.js",
  "angular": "Angular", "svelte": "Svelte",
  "node.js": "Node.js", "nodejs": "Node.js",
  "react native": "React Native", "flutter": "Flutter",
  "tailwindcss": "Tailwind CSS", "tailwind": "Tailwind CSS",
  "mysql": "MySQL", "sqlite": "SQLite", "elasticsearch": "Elasticsearch",
  "github": "GitHub", "gitlab": "GitLab", "git": "Git",
  "django": "Django", "flask": "Flask", "fastapi": "FastAPI", "fastify": "Fastify",
  "express": "Express.js", "nestjs": "NestJS", "rails": "Ruby on Rails",
  "prisma": "Prisma", "drizzle": "Drizzle", "typeorm": "TypeORM",
  "jest": "Jest", "vitest": "Vitest", "playwright": "Playwright", "cypress": "Cypress",
  "tensorflow": "TensorFlow", "pytorch": "PyTorch", "pandas": "Pandas", "numpy": "NumPy",
  "jwt": "JWT", "oauth": "OAuth", "rbac": "RBAC", "rag": "RAG",
  "html": "HTML", "css": "CSS", "html5": "HTML5", "css3": "CSS3",
  "php": "PHP", "sql": "SQL", "bash": "Bash", "linux": "Linux",
  "restful api": "REST API", "rest": "REST",
  "microservices": "Microservices",
  "firebase": "Firebase", "supabase": "Supabase",
  "vercel": "Vercel", "netlify": "Netlify", "heroku": "Heroku",
  "langchain": "LangChain", "openai": "OpenAI", "stripe": "Stripe", "clerk": "Clerk",
};

export function extractSkillsFromJD(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  for (const skill of TECH_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?<![a-z0-9./])${escaped}(?![a-z0-9./])`, "i");
    if (re.test(lower)) {
      const display = SKILL_DISPLAY[skill] ?? skill.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      found.add(display);
    }
  }

  // Deduplicate after normalisation
  return [...new Set([...found])].sort();
}

// ─── Main entry point ──────────────────────────────────────────────────────────

export function parseJobFromText(text: string, overrideTitle?: string): ParsedJob {
  const description = text.replace(/\s+/g, " ").trim().slice(0, 5000);
  const title = overrideTitle?.trim() || extractJobTitle(text);
  const requiredSkills = extractSkillsFromJD(text);
  const experienceYears = extractRequiredYears(text);

  return { title, requiredSkills, experienceYears, description };
}
