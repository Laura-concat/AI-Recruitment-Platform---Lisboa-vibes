// CV text extraction and field parsing — section-aware, works with unstructured PDF text

export interface ParsedProfile {
  fullName: string | null;
  summary: string | null;
  skills: string[];
  languages: string[];
  experienceYears: number | null;
  seniorityLevel: "junior" | "mid" | "senior" | "lead" | null;
  experienceItems: { role: string; company: string; period: string }[];
  education: { degree: string; institution: string; year?: number } | null;
}

// ─── Text extraction ───────────────────────────────────────────────────────────

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    const { extractText } = await import("unpdf");
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    return text;
  }
  if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value as string;
  }
  return "";
}

// ─── Section splitting ─────────────────────────────────────────────────────────

// Matches common CV section headings that appear inline in extracted PDF text.
// Single-word ambiguous terms (Experience, Summary, Skills) use negative lookaheads
// to avoid matching them mid-sentence ("experience in the field", "skills to build…").
const SECTION_RE = new RegExp(
  [
    // Safe multi-word headers
    "Professional\\s+Summary",
    "Career\\s+Summary",
    "Executive\\s+Summary",
    "Professional\\s+Objective",
    "Career\\s+Objective",
    "Professional\\s+Profile",
    "Professional\\s+Experience",
    "Work\\s+Experience",
    "Employment\\s+History",
    "Career\\s+History",
    "Academic\\s+Background",
    "Academic\\s+Qualifications",
    "Technical\\s+Skills",
    "Core\\s+Skills",
    "Key\\s+Skills",
    "Core\\s+Competencies",
    "Language\\s+Skills",
    "Project\\s+Experience",
    "Key\\s+Projects",
    "Volunteer\\s+Experience",
    "Community\\s+Service",
    // Single-word headers with guards against inline usage
    "(?:Experience|Experiences)(?!\\s+(?:in|with|of|at|from|for|to|that|which|and|or|working|building|creating|using|a\\b|the\\b))",
    "(?:Summary)(?!\\s+(?:of|in|that|which|for|report))",
    "(?:Skills)(?!\\s+(?:in|for|to|and|or|are|is|include|like|such|the\\b|a\\b))",
    // Rarely ambiguous single-word headers
    "Education",
    "Languages?",
    "Projects?",
    "Certifications?",
    "Volunteering?",
    "Awards",
    "Publications",
    "References",
  ].map((p) => `(?:${p})`).join("|"),
  "gi"
);

interface Section {
  key: string;
  content: string;
}

function splitIntoSections(text: string): { contact: string; sections: Section[] } {
  const matches: Array<{ key: string; index: number; end: number }> = [];
  let m: RegExpExecArray | null;
  // Create a fresh regex instance each call (global regex has stateful lastIndex)
  const re = new RegExp(SECTION_RE.source, "gi");
  while ((m = re.exec(text)) !== null) {
    matches.push({
      key: m[0].toLowerCase().replace(/\s+/g, "_"),
      index: m.index,
      end: m.index + m[0].length,
    });
  }

  if (matches.length === 0) {
    return { contact: text, sections: [] };
  }

  const contact = text.slice(0, matches[0].index).trim();
  const sections: Section[] = matches.map((match, i) => ({
    key: match.key,
    content: text.slice(match.end, i + 1 < matches.length ? matches[i + 1].index : text.length).trim(),
  }));

  return { contact, sections };
}

function getSection(sections: Section[], ...keys: string[]): string {
  for (const key of keys) {
    const found = sections.find((s) => s.key === key || s.key.includes(key));
    if (found) return found.content;
  }
  return "";
}

// ─── Name extraction ───────────────────────────────────────────────────────────

function extractName(contactText: string): string | null {
  // Strip emails, phones, URLs, known keywords, separators
  const cleaned = contactText
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "")
    .replace(/[\+\d][\d\s\-().]{6,}/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\b(linkedin|github|portfolio|website|blog|twitter|instagram|facebook|leetcode|gitlab)\b/gi, "")
    .replace(/[|·•,/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // First 2–4 consecutive words that are all alphabetic (name-like)
  const words = cleaned.split(/\s+/).filter(Boolean);
  const nameWords: string[] = [];
  for (const word of words.slice(0, 6)) {
    if (/^[\p{L}\-'.]+$/u.test(word)) {
      nameWords.push(word);
      if (nameWords.length === 4) break;
    } else {
      break;
    }
  }
  return nameWords.length >= 2 ? nameWords.join(" ") : null;
}

// ─── Summary extraction ────────────────────────────────────────────────────────

function extractSummary(summarySection: string): string | null {
  if (!summarySection) return null;
  // Clean and take the first meaningful chunk (up to ~400 chars)
  const cleaned = summarySection.replace(/\s+/g, " ").trim();
  if (cleaned.length < 30) return null;
  return cleaned.slice(0, 420).trimEnd();
}

// ─── Experience items extraction ───────────────────────────────────────────────

const MONTH_PAT = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DATE_PAT = `${MONTH_PAT}\\s+\\d{4}`;
const DATE_RANGE_RE = new RegExp(
  `(${DATE_PAT})\\s*[–—-]\\s*(${DATE_PAT}|Present|Current|Now|Ongoing)`,
  "gi"
);

function extractExperienceItems(expSection: string): { role: string; company: string; period: string }[] {
  if (!expSection) return [];

  // Collect all date range positions
  const dateMatches: Array<{ period: string; index: number; end: number }> = [];
  const re = new RegExp(DATE_RANGE_RE.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(expSection)) !== null) {
    dateMatches.push({ period: `${m[1]} – ${m[2]}`, index: m.index, end: re.lastIndex });
  }

  const items: { role: string; company: string; period: string }[] = [];

  for (const { period, index } of dateMatches) {
    // Look back up to 130 chars before the date for "Role – Company [, Location]"
    const lookback = Math.max(0, index - 130);
    const prefix = expSection.slice(lookback, index);

    // The last en/em-dash in the lookback window separates role from company
    const sepIdx = Math.max(prefix.lastIndexOf("–"), prefix.lastIndexOf("—"));
    if (sepIdx < 0) continue;

    let company = prefix.slice(sepIdx + 1).trim();
    const commaIdx = company.indexOf(",");
    if (commaIdx > 2) company = company.slice(0, commaIdx).trim();
    company = company.slice(0, 60).trim();

    // Role: text before the separator — strip any bullet/sentence content by
    // starting at the first capital letter after ". " or double-space
    const beforeSep = prefix.slice(0, sepIdx);
    const sentenceEnd = Math.max(beforeSep.lastIndexOf(". "), beforeSep.lastIndexOf("  "));
    const roleStart = sentenceEnd >= 0 ? sentenceEnd + 2 : 0;
    const role = beforeSep.slice(roleStart).trim();

    if (role.length > 3 && role.length < 100 && company.length > 0) {
      items.push({ role: role.slice(0, 80), company, period });
    }
  }

  const seen = new Set<string>();
  return items
    .filter(({ role, period }) => {
      const k = `${role}|${period}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 6);
}

// ─── Education extraction ──────────────────────────────────────────────────────

function extractEducation(eduSection: string): { degree: string; institution: string; year?: number } | null {
  if (!eduSection) return null;

  // Match degree phrase (stops before comma or date)
  const degreeRe = /\b(bachelor[^,\n]{0,70}|master[^,\n]{0,70}|b\.?sc[^,\n]{0,50}|m\.?sc[^,\n]{0,50}|ph\.?d[^,\n]{0,50}|mba[^,\n]{0,50}|diploma[^,\n]{0,50}|associate[^,\n]{0,50})\b/i;
  const degreeMatch = eduSection.match(degreeRe);
  if (!degreeMatch) return null;

  let degree = degreeMatch[1].trim();
  // Trim at comma if present
  const commaInDegree = degree.indexOf(",");
  if (commaInDegree > 3) degree = degree.slice(0, commaInDegree).trim();
  if (degree.length > 100) degree = degree.slice(0, 100);

  // Find end year from a date range
  const dateRangeMatch = eduSection.match(
    new RegExp(`${DATE_PAT}\\s*[–—-]\\s*(${DATE_PAT}|(?:(\\d{4}))|(Present|Current))`, "i")
  );
  // Extract the end year
  let year: number | undefined;
  if (dateRangeMatch) {
    // Find all 4-digit years in the date range match, take the last one
    const years = [...dateRangeMatch[0].matchAll(/\b(20\d\d|19\d\d)\b/g)].map((m) =>
      parseInt(m[1], 10)
    );
    year = years.at(-1);
  } else {
    // Fallback: any 4-digit year in the section
    const yearMatch = eduSection.match(/\b(20\d\d|19\d\d)\b/);
    if (yearMatch) year = parseInt(yearMatch[1], 10);
  }

  // Institution: text immediately after the date range, or after degree phrase
  let institution = "";
  if (dateRangeMatch) {
    const afterDate = eduSection.slice(
      eduSection.indexOf(dateRangeMatch[0]) + dateRangeMatch[0].length
    ).trim();
    // Take text up to first double-space or 80 chars
    institution = afterDate.replace(/\s+/g, " ").split(/\s{2,}/)[0].trim().slice(0, 80);
  }

  return { degree: degree.trim(), institution, year };
}

// ─── Skills dictionary ─────────────────────────────────────────────────────────

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

function extractSkills(text: string): string[] {
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

  return [...found].sort();
}

// ─── Language extraction ───────────────────────────────────────────────────────

const HUMAN_LANGUAGES = [
  "english","arabic","french","spanish","german","italian","portuguese","dutch","russian","chinese",
  "mandarin","japanese","korean","turkish","persian","farsi","urdu","hindi","bengali","swahili",
];

function extractLanguages(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const lang of HUMAN_LANGUAGES) {
    if (new RegExp(`\\b${lang}\\b`, "i").test(lower)) {
      found.push(lang.charAt(0).toUpperCase() + lang.slice(1));
    }
  }
  return [...new Set(found)];
}

// ─── Experience years ──────────────────────────────────────────────────────────

function extractExperienceYears(text: string): number | null {
  const explicit = [
    // "X years of [professional] experience"
    /(\d+)\+?\s*years?\s+of\s+(?:professional\s+|industry\s+)?experience/i,
    // "X years experience [in/as/...]" — no "of"
    /(\d+)\+?\s*years?\s+experience(?:\s+(?:in|as|with|at|of)\b)?/i,
    // "X yrs of experience" / "X yrs experience"
    /(\d+)\+?\s*yrs?\s+(?:of\s+)?experience/i,
    // "experience of X years"
    /experience\s+of\s+(\d+)\+?\s*years?/i,
    // "over/more than X years"
    /(?:over|more\s+than|nearly|almost)\s+(\d+)\s*years?\s+(?:of\s+)?(?:professional\s+)?experience/i,
    // "X-year career / track record / professional"
    /(\d+)-year\s+(?:career|track\s+record|professional|background|industry|work)/i,
    // "worked for X years"
    /worked\s+(?:for\s+)?(\d+)\+?\s*years?/i,
  ];
  for (const re of explicit) {
    const m = text.match(re);
    if (m) return parseInt(m[1], 10);
  }

  // Sum year ranges
  const now = new Date().getFullYear();
  let totalMonths = 0;
  const rangeRe = new RegExp(`(${DATE_PAT})\\s*[–—-]\\s*(${DATE_PAT}|Present|Current|Now|Ongoing)`, "gi");
  let m: RegExpExecArray | null;
  while ((m = rangeRe.exec(text)) !== null) {
    const startYearMatch = m[1].match(/\d{4}/);
    const endStr = m[2];
    if (!startYearMatch) continue;
    const startYear = parseInt(startYearMatch[0], 10);
    const startMonthMatch = m[1].match(/[A-Za-z]+/);
    const startMonth = startMonthMatch ? parseMonth(startMonthMatch[0]) : 0;

    let endYear: number;
    let endMonth: number;
    if (/present|current|now|ongoing/i.test(endStr)) {
      endYear = now;
      endMonth = new Date().getMonth();
    } else {
      const endYearMatch = endStr.match(/\d{4}/);
      const endMonthMatch = endStr.match(/[A-Za-z]+/);
      if (!endYearMatch) continue;
      endYear = parseInt(endYearMatch[0], 10);
      endMonth = endMonthMatch ? parseMonth(endMonthMatch[0]) : 11;
    }
    totalMonths += Math.max(0, (endYear - startYear) * 12 + (endMonth - startMonth));
  }
  if (totalMonths > 0) return Math.round(totalMonths / 12);
  return null;
}

function parseMonth(monthStr: string): number {
  const months: Record<string, number> = {
    jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,
  };
  return months[monthStr.toLowerCase().slice(0, 3)] ?? 0;
}

function inferSeniority(years: number | null): "junior" | "mid" | "senior" | "lead" | null {
  if (years === null) return null;
  if (years <= 2) return "junior";
  if (years <= 5) return "mid";
  if (years <= 10) return "senior";
  return "lead";
}

// ─── Main entry point ──────────────────────────────────────────────────────────

export function parseProfileFromText(text: string): ParsedProfile {
  const { contact, sections } = splitIntoSections(text);

  const summarySection = getSection(sections, "professional_summary", "summary", "objective", "profile");
  const expSection = getSection(sections, "professional_experience", "work_experience", "employment_history", "experience");
  const eduSection = getSection(sections, "education", "academic_background");

  const fullName = extractName(contact);
  const summary = extractSummary(summarySection);
  const skills = extractSkills(text);
  const languages = extractLanguages(text);
  const experienceItems = extractExperienceItems(expSection || text);
  const education = extractEducation(eduSection || text);
  const experienceYears = extractExperienceYears(expSection || text);
  const seniorityLevel = inferSeniority(experienceYears);

  return { fullName, summary, skills, languages, experienceYears, seniorityLevel, experienceItems, education };
}
