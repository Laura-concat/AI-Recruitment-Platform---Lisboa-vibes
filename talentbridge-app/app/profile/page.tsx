"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { updateProfile } from "@/app/actions/updateProfile";

// Map of normalised skill name → devicons path segment
const DEVICON_MAP: Record<string, string> = {
  "react": "react/react-original",
  "react native": "react/react-original",
  "next.js": "nextjs/nextjs-original",
  "nextjs": "nextjs/nextjs-original",
  "node.js": "nodejs/nodejs-original",
  "nodejs": "nodejs/nodejs-original",
  "typescript": "typescript/typescript-original",
  "javascript": "javascript/javascript-original",
  "python": "python/python-original",
  "django": "django/django-plain",
  "fastapi": "fastapi/fastapi-original",
  "vue.js": "vuejs/vuejs-original",
  "vuejs": "vuejs/vuejs-original",
  "angular": "angularjs/angularjs-original",
  "html": "html5/html5-original",
  "css": "css3/css3-original",
  "tailwind": "tailwindcss/tailwindcss-original",
  "tailwindcss": "tailwindcss/tailwindcss-original",
  "graphql": "graphql/graphql-plain",
  "redux": "redux/redux-original",
  "postgresql": "postgresql/postgresql-original",
  "postgres": "postgresql/postgresql-original",
  "mysql": "mysql/mysql-original",
  "mongodb": "mongodb/mongodb-original",
  "redis": "redis/redis-original",
  "firebase": "firebase/firebase-plain",
  "docker": "docker/docker-original",
  "kubernetes": "kubernetes/kubernetes-plain",
  "aws": "amazonwebservices/amazonwebservices-plain-wordmark",
  "git": "git/git-original",
  "php": "php/php-original",
  "java": "java/java-original",
  "go": "go/go-original",
  "golang": "go/go-original",
  "rust": "rust/rust-original",
  "swift": "swift/swift-original",
  "kotlin": "kotlin/kotlin-original",
  "flutter": "flutter/flutter-original",
  "dart": "dart/dart-original",
  "linux": "linux/linux-original",
  "figma": "figma/figma-original",
  "laravel": "laravel/laravel-original",
  "express": "express/express-original",
  "expressjs": "express/express-original",
  "svelte": "svelte/svelte-original",
  "elixir": "elixir/elixir-original",
  "ruby": "ruby/ruby-original",
  "rails": "rails/rails-original",
  "c#": "csharp/csharp-original",
  "c++": "cplusplus/cplusplus-original",
  ".net": "dotnetcore/dotnetcore-original",
  "azure": "azure/azure-original",
  "gcp": "googlecloud/googlecloud-original",
};

function SkillBadge({ skill }: { skill: string }) {
  const key = skill.toLowerCase();
  const iconPath = DEVICON_MAP[key];
  const [imgFailed, setImgFailed] = useState(false);

  if (iconPath && !imgFailed) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
        <img
          src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconPath}.svg`}
          alt={skill}
          width={18}
          height={18}
          className="flex-shrink-0"
          onError={() => setImgFailed(true)}
        />
        <span className="text-sm font-semibold text-gray-800">{skill}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-3 py-2">
      <span className="text-sm font-semibold text-[#1a3d2b]">{skill}</span>
    </span>
  );
}

function formatEducation(edu: unknown): string {
  if (!edu) return "";
  if (typeof edu === "string") return edu;
  if (typeof edu === "object") {
    const e = edu as { degree?: string; institution?: string; year?: number };
    return [e.degree, e.institution, e.year].filter(Boolean).join(" — ");
  }
  return "";
}

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
}

interface CandidateProfile {
  name: string;
  initials: string;
  title: string;
  experience: string;
  location: string;
  availability: string;
  languages: string[];
  completeness: number;
  skills: string[];
  experienceLevel: string;
  experienceYears: number;
  languageProficiency: string;
  education: string;
  availability2: string;
  summary: string;
  experience_items: ExperienceItem[];
  isVisible: boolean;
}

const INITIAL: CandidateProfile = {
  name: "",
  initials: "",
  title: "",
  experience: "",
  location: "",
  availability: "",
  languages: [],
  completeness: 0,
  skills: [],
  experienceLevel: "",
  experienceYears: 0,
  languageProficiency: "",
  education: "",
  availability2: "",
  summary: "",
  experience_items: [],
  isVisible: false,
};

function calcCompleteness(data: {
  name: string;
  summary: string;
  skills: string[];
  experience_items: ExperienceItem[];
  education: string;
  languages: string[];
}): number {
  let score = 0;
  if (data.name) score += 20;
  if (data.summary) score += 20;
  if (data.skills.length > 0) score += 25;
  if (data.experience_items.length > 0) score += 20;
  if (data.education) score += 10;
  if (data.languages.length > 0) score += 5;
  return Math.min(score, 100);
}

function getCompletenessTips(data: {
  name: string;
  summary: string;
  skills: string[];
  experience_items: ExperienceItem[];
  education: string;
  languages: string[];
}): string[] {
  const tips: string[] = [];
  if (!data.name) tips.push("Add your full name");
  if (!data.summary) tips.push("Add a professional summary");
  if (data.skills.length === 0) tips.push("Add your technical skills");
  if (data.experience_items.length === 0) tips.push("Add your work experience");
  if (!data.education) tips.push("Add your education details");
  if (data.languages.length === 0) tips.push("Add the languages you speak");
  return tips;
}

function createProfileDraft(source: CandidateProfile): CandidateProfile {
  return {
    ...source,
    languages: [...source.languages],
    skills: [...source.skills],
    experience_items: source.experience_items.map((item) => ({ ...item })),
  };
}

export default function CandidateProfilePage() {
  const { user } = useUser();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CandidateProfile>(() => createProfileDraft(INITIAL));
  const [draft, setDraft] = useState<CandidateProfile>(() => createProfileDraft(INITIAL));
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  // Raw string inputs so comma-typing works naturally; parsed to arrays on save
  const [skillsRaw, setSkillsRaw] = useState("");
  const [langsRaw, setLangsRaw] = useState("");

  // Fetch real profile from DB on mount
  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) { setHasProfile(false); return null; }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setHasProfile(true);
        const name = data.fullName ?? user?.fullName ?? user?.firstName ?? INITIAL.name;
        const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
        const eduStr = formatEducation(data.education) || "";
        const yrs = data.experienceYears ?? null;
        const skills = data.skills ?? [];
        const languages = data.languages ?? [];
        const experience_items = Array.isArray(data.experienceItems) && data.experienceItems.length
          ? data.experienceItems : [];
        const merged: CandidateProfile = {
          ...INITIAL,
          name,
          initials,
          experience: yrs != null ? `${yrs} yr${yrs !== 1 ? "s" : ""}` : "",
          skills,
          languages,
          summary: data.summary ?? "",
          education: eduStr,
          experience_items,
          experienceYears: yrs ?? 0,
          experienceLevel: data.seniorityLevel ?? "",
          languageProficiency: languages.join(" & ") || "",
          location: data.location ?? "",
          availability2: data.availability ?? "",
          isVisible: data.isVisible ?? false,
          completeness: calcCompleteness({ name, summary: data.summary ?? "", skills, experience_items, education: eduStr, languages }),
        };
        setProfile(createProfileDraft(merged));
        setDraft(createProfileDraft(merged));
      })
      .catch(() => setHasProfile(false));
  }, [user]);

  if (hasProfile === false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar variant="candidate" />
        <div className="mx-auto max-w-4xl px-6 py-20 flex flex-col items-center text-center">
          <div className="text-6xl mb-6">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="text-gray-500 mb-8 max-w-md text-sm">
            Upload your CV and our AI will automatically build your profile — extracting your skills,
            experience, languages, and more.
          </p>
          <Link
            href="/onboarding/upload"
            className="bg-[#1a3d2b] text-white px-6 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Upload your CV to get started →
          </Link>
        </div>
      </div>
    );
  }

  function startEdit() {
    const d = createProfileDraft(profile);
    setDraft(d);
    setSkillsRaw(d.skills.join(", "));
    setLangsRaw(d.languages.join(", "));
    setEditing(true);
    setSaved(false);
  }

  function cancelEdit() {
    setEditing(false);
    setValidationError(null);
  }

  function wordCount(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  async function saveEdit() {
    setValidationError(null);
    const parsedSkills = skillsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    const parsedLangs = langsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    const summaryWords = wordCount(draft.summary);

    if (!draft.name.trim()) { setValidationError("Please add your full name."); return; }
    if (!draft.summary.trim() || summaryWords < 25) { setValidationError(`Summary needs at least 25 words (currently ${summaryWords}).`); return; }
    if (summaryWords > 150) { setValidationError(`Summary is too long — maximum 150 words (currently ${summaryWords}).`); return; }
    if (parsedSkills.length === 0) { setValidationError("Please add at least one technical skill."); return; }
    if (!draft.location) { setValidationError("Please select your location."); return; }
    if (!draft.availability2) { setValidationError("Please select your availability."); return; }
    if (parsedLangs.length === 0) { setValidationError("Please add at least one language you speak."); return; }

    setSaving(true);
    try {
      await updateProfile({
        fullName: draft.name,
        summary: draft.summary,
        skills: parsedSkills,
        languages: parsedLangs,
        location: draft.location || undefined,
        education: draft.education,
        experienceItems: draft.experience_items,
        experienceYears: draft.experienceYears || undefined,
        availability: draft.availability2 || undefined,
      });
      setProfile(createProfileDraft({ ...draft, skills: parsedSkills, languages: parsedLangs }));
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setValidationError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="candidate" userName={profile.name} />

      <div className="mx-auto max-w-4xl px-6 py-10">
        {saved && (
          <div className="mb-4 bg-[#f0fdf4] border border-[#bbf7d0] text-[#1a3d2b] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span>✓</span> Profile saved successfully.
          </div>
        )}

        {/* Vetting steps banner — shown until profile is published */}
        {!profile.isVisible && hasProfile && !editing && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-xl mt-0.5">🔒</span>
              <div>
                <h2 className="font-semibold text-amber-900 text-sm">Your profile is not yet published</h2>
                <p className="text-xs text-amber-700 mt-0.5">
                  Complete the steps below to have your profile reviewed and made visible to hiring companies.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <VettingStep number={1} title="Upload your CV & build your profile" done />
              <VettingStep number={2} title="Complete technical assessment" done={false} comingSoon />
              <VettingStep number={3} title="Answer profile Q&A questions" done={false} comingSoon />
            </div>
          </div>
        )}

        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1a3d2b] text-white flex items-center justify-center text-2xl font-bold">
              {profile.initials}
            </div>
            <div>
              {editing ? (
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="text-2xl font-bold text-gray-900 border-b border-[#1a3d2b] focus:outline-none bg-transparent w-64"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              )}
              {editing ? (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">Yrs exp:</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={draft.experienceYears}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setDraft({
                        ...draft,
                        experienceYears: isNaN(v) ? 0 : v,
                        experience: isNaN(v) || v === 0 ? "" : `${v} yr${v !== 1 ? "s" : ""}`,
                      });
                    }}
                    className="w-16 text-sm border border-gray-300 rounded-md px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-sm mt-0.5">
                  {[
                    profile.experience || null,
                    profile.location || "Location not set",
                    profile.availability2 || null,
                    profile.languages.length ? profile.languages.join(" & ") : null,
                  ].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={cancelEdit}
                  className="text-sm border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="text-sm bg-[#1a3d2b] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                onClick={startEdit}
                className="text-sm bg-[#1a3d2b] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: AI analysis */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-[#1a3d2b] bg-[#f0fdf4] px-2 py-0.5 rounded">
                  AI Match Analysis
                </span>
              </div>
              <div className="text-5xl font-bold text-[#1a3d2b] mb-1">
                {profile.completeness}%
              </div>
              <p className="text-xs text-gray-400 mb-3">Profile completeness</p>
              {profile.completeness < 100 && (() => {
                const tips = getCompletenessTips({
                  name: profile.name,
                  summary: profile.summary,
                  skills: profile.skills,
                  experience_items: profile.experience_items,
                  education: profile.education,
                  languages: profile.languages,
                });
                return tips.length > 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                    <p className="text-xs font-semibold text-amber-700 mb-1.5">To reach 100%:</p>
                    <ul className="space-y-1">
                      {tips.map((tip) => (
                        <li key={tip} className="text-xs text-amber-700 flex items-start gap-1.5">
                          <span className="mt-0.5">→</span>{tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              })()}
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Technical Skills</span>
                  <span className="font-medium">9/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience Level</span>
                  <span className="font-medium">{profile.experienceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Language Fit</span>
                  <span className="font-medium">{profile.languageProficiency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Education</span>
                  <span className="font-medium">BSc</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Technical Skills</h3>
              {editing ? (
                <div>
                  <input
                    value={skillsRaw}
                    onChange={(e) => setSkillsRaw(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
                    placeholder="React, Node.js, TypeScript..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Languages</h3>
              {editing ? (
                <div>
                  <input
                    value={langsRaw}
                    onChange={(e) => setLangsRaw(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
                    placeholder="Arabic, English, French..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.languages.length > 0 ? profile.languages.map((lang) => (
                    <span key={lang} className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-lg">
                      🗣 {lang}
                    </span>
                  )) : (
                    <p className="text-xs text-gray-400">No languages added yet</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Summary <span className="text-red-500">*</span></h3>
              {editing ? (
                <>
                  <textarea
                    value={draft.summary}
                    onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                    rows={4}
                    className="w-full text-sm text-gray-600 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] resize-none"
                    placeholder="Describe your background, expertise, and what makes you stand out as a developer..."
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">Min 25 words — max 150 words</p>
                    <p className={`text-xs font-medium ${wordCount(draft.summary) < 25 ? "text-amber-500" : wordCount(draft.summary) > 150 ? "text-red-500" : "text-[#1a3d2b]"}`}>
                      {wordCount(draft.summary)} / 150
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600">{profile.summary}</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Experience</h3>
              <div className="space-y-3">
                {profile.experience_items.map((exp, i) => (
                  <div key={exp.role} className="flex justify-between items-start">
                    {editing ? (
                      <div className="flex-1 grid grid-cols-2 gap-2 mr-4">
                        <input
                          value={draft.experience_items[i]?.role ?? ""}
                          onChange={(e) => {
                            const items = [...draft.experience_items];
                            items[i] = { ...items[i], role: e.target.value };
                            setDraft({ ...draft, experience_items: items });
                          }}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
                          placeholder="Role"
                        />
                        <input
                          value={draft.experience_items[i]?.company ?? ""}
                          onChange={(e) => {
                            const items = [...draft.experience_items];
                            items[i] = { ...items[i], company: e.target.value };
                            setDraft({ ...draft, experience_items: items });
                          }}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
                          placeholder="Company"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-900">{exp.role}</p>
                        <p className="text-xs text-gray-500">{exp.company}</p>
                      </div>
                    )}
                    <span className="text-xs text-gray-400 flex-shrink-0">{exp.period}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Location <span className="text-red-500">*</span></h3>
              {editing ? (
                <select
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] bg-white"
                >
                  <option value="">Select your country…</option>
                  <optgroup label="MENA Region">
                    <option>Lebanon</option>
                    <option>Jordan</option>
                    <option>Egypt</option>
                    <option>Syria</option>
                    <option>Iraq</option>
                    <option>Palestine</option>
                    <option>Morocco</option>
                    <option>Tunisia</option>
                    <option>Algeria</option>
                    <option>Libya</option>
                    <option>Yemen</option>
                    <option>Sudan</option>
                  </optgroup>
                  <optgroup label="Gulf">
                    <option>UAE</option>
                    <option>Saudi Arabia</option>
                    <option>Qatar</option>
                    <option>Kuwait</option>
                    <option>Bahrain</option>
                    <option>Oman</option>
                  </optgroup>
                  <optgroup label="Europe">
                    <option>Germany</option>
                    <option>France</option>
                    <option>Netherlands</option>
                    <option>Sweden</option>
                    <option>UK</option>
                    <option>Spain</option>
                    <option>Portugal</option>
                    <option>Turkey</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option>Canada</option>
                    <option>USA</option>
                    <option>Australia</option>
                    <option>Other</option>
                  </optgroup>
                </select>
              ) : (
                <p className="text-sm text-gray-600">{profile.location || <span className="text-gray-400 italic">Not set</span>}</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
              {editing ? (
                <input
                  value={draft.education}
                  onChange={(e) => setDraft({ ...draft, education: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
                />
              ) : (
                <p className="text-sm text-gray-600">{profile.education}</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Availability</h3>
              <select
                value={editing ? draft.availability2 : profile.availability2}
                onChange={async (e) => {
                  const val = e.target.value;
                  if (editing) {
                    setDraft({ ...draft, availability2: val });
                  } else {
                    setProfile({ ...profile, availability2: val });
                    await updateProfile({ availability: val || undefined });
                  }
                }}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] bg-white"
              >
                <option value="">Select availability…</option>
                <option value="Available — Full-time">Available — Full-time</option>
                <option value="Available — Part-time">Available — Part-time</option>
                <option value="Available — Freelance / Contract">Available — Freelance / Contract</option>
                <option value="Open to offers">Open to offers</option>
                <option value="Not currently available">Not currently available</option>
              </select>
            </div>

          </div>
        </div>

        {/* Sticky save bar — visible when editing */}
        {editing && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4 mt-6 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex-1">
              {validationError && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <span>⚠</span> {validationError}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={cancelEdit}
                className="text-sm border border-gray-300 px-5 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="text-sm bg-[#1a3d2b] text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VettingStep({ number, title, done, comingSoon }: {
  number: number;
  title: string;
  done: boolean;
  comingSoon?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {done ? (
        <span className="w-6 h-6 rounded-full bg-[#1a3d2b] text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">✓</span>
      ) : (
        <span className="w-6 h-6 rounded-full border-2 border-amber-300 text-amber-500 text-xs flex items-center justify-center flex-shrink-0 font-bold">{number}</span>
      )}
      <span className={`text-sm flex-1 ${done ? "text-gray-700 line-through" : "text-amber-800 font-medium"}`}>{title}</span>
      {comingSoon && (
        <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">Coming soon</span>
      )}
      {done && (
        <span className="text-xs bg-[#f0fdf4] text-[#1a3d2b] px-2 py-0.5 rounded-full font-medium">Complete</span>
      )}
    </div>
  );
}
