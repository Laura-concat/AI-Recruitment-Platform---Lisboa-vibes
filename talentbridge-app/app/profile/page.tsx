"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/navbar";

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
}

const INITIAL = {
  name: "Leila Mansour",
  initials: "LM",
  title: "Full-Stack Developer",
  experience: "5 yrs",
  location: "Beirut, Lebanon",
  availability: "Remote-ready",
  languages: ["Arabic", "English"],
  completeness: 92,
  skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
  experienceLevel: "Senior",
  experienceYears: 5,
  languageProficiency: "Arabic & English",
  education: "BSc Computer Science — AUB, 2019",
  availability2: "Full-time · Remote · From June 2026",
  summary:
    "Experienced full-stack developer with 5 years in Fintech & e-commerce across MENA. Bilingual Arabic/English.",
  experience_items: [
    { role: "Senior Frontend Dev", company: "Fintech Startup, Beirut", period: "2022–Present" },
    { role: "Full-Stack Developer", company: "E-commerce Agency, Amman", period: "2019–2022" },
  ],
};

function createProfileDraft(source: CandidateProfile): CandidateProfile {
  return {
    ...source,
    languages: [...source.languages],
    skills: [...source.skills],
    experience_items: source.experience_items.map((item) => ({ ...item })),
  };
}

export default function CandidateProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile>(() => createProfileDraft(INITIAL));
  const [draft, setDraft] = useState<CandidateProfile>(() => createProfileDraft(INITIAL));

  function startEdit() {
    setDraft(createProfileDraft(profile));
    setEditing(true);
    setSaved(false);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function saveEdit() {
    setProfile(createProfileDraft(draft));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
              <p className="text-gray-500 text-sm mt-0.5">
                {profile.title} · {profile.experience} · {profile.location} · Remote-ready · {profile.languages.join(" & ")}
              </p>
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
                  className="text-sm bg-[#1a3d2b] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={startEdit}
                className="text-sm border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Edit Profile
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
              <p className="text-xs text-gray-400">Profile completeness</p>
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
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Skills</h3>
              {editing ? (
                <div>
                  <input
                    value={draft.skills.join(", ")}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
                    placeholder="React, Node.js, TypeScript..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="text-xs bg-[#f0fdf4] text-[#1a3d2b] border border-[#bbf7d0] px-2 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
              {editing ? (
                <textarea
                  value={draft.summary}
                  onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                  rows={3}
                  className="w-full text-sm text-gray-600 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] resize-none"
                />
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
              {editing ? (
                <input
                  value={draft.availability2}
                  onChange={(e) => setDraft({ ...draft, availability2: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
                />
              ) : (
                <p className="text-sm text-gray-600">{profile.availability2}</p>
              )}
            </div>

            {!editing && (
              <div className="flex gap-3">
                <Link
                  href="/dashboard"
                  className="bg-[#1a3d2b] text-white text-sm px-6 py-2 rounded-md hover:opacity-90 transition-opacity"
                >
                  Go to Dashboard →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
