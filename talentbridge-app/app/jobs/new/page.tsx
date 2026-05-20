"use client";

import { Navbar } from "@/components/navbar";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/app/actions/createJob";

type Mode = "write" | "upload";

export default function PostJobPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("write");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Controlled fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [location, setLocation] = useState("Remote");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [deadline, setDeadline] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setUploadedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) setUploadedFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("employmentType", employmentType);
      formData.set("location", location);
      formData.set("country", country);
      formData.set("city", city);
      formData.set("applyDeadline", deadline);
      if (mode === "upload" && uploadedFile) {
        formData.set("file", uploadedFile);
      }

      const result = await createJob(formData);
      if ("error" in result) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push("/dashboard/client");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a New Job</h1>
        <p className="text-sm text-gray-500 mb-6">
          Fill in the details or upload a JD file — our AI will extract the requirements automatically.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 w-fit gap-1 mb-8">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "write"
                ? "bg-[#1a3d2b] text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ✏️ Write Job Description
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "upload"
                ? "bg-[#1a3d2b] text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📄 Upload JD File
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-5">

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior React Developer"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Employment Type *
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] bg-white"
                >
                  <option>Full-time</option>
                  <option>Contract</option>
                  <option>Part-time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location *
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] bg-white"
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
              </div>
            </div>

            {location === "On-site" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United Arab Emirates"
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dubai"
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Application Deadline *
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] bg-white"
              />
            </div>

            {/* Mode-specific section */}
            {mode === "write" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Job Description *
                </label>
                <textarea
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, required skills, and years of experience..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] resize-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Upload Job Description (PDF or DOCX)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {uploadedFile ? (
                  <div className="border-2 border-[#1a3d2b] bg-[#f0fdf4] rounded-xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-400">
                          {(uploadedFile.size / 1024).toFixed(0)} KB · AI will extract requirements
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                      dragging
                        ? "border-[#1a3d2b] bg-[#f0fdf4]"
                        : "border-gray-300 hover:border-[#1a3d2b] hover:bg-[#f0fdf4]"
                    }`}
                  >
                    <div className="text-4xl mb-3">📂</div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Drag &amp; drop your JD here, or click to browse
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Supported: PDF, DOC, DOCX — Max 10 MB
                    </p>
                    <button
                      type="button"
                      className="bg-[#1a3d2b] text-white text-sm px-5 py-2 rounded-md hover:opacity-90 transition-opacity"
                    >
                      Browse Files
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                  <span>🤖</span>
                  We will read the file and automatically extract skills and requirements.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1a3d2b] text-white py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              )}
              {submitting ? "Posting..." : "Post Job & Start AI Matching →"}
            </button>
          </form>

          {/* Tips sidebar */}
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-5 h-fit">
            <h3 className="font-semibold text-[#1a3d2b] mb-3 text-sm">Tips for better matches</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Be specific about tech stack</li>
              <li>✓ Include seniority level clearly</li>
              <li>✓ Mention Arabic language requirements</li>
              <li>✓ List must-have vs nice-to-have skills</li>
              <li>✓ Add salary range for faster matches</li>
              <li>✓ Specify timezone preferences for remote roles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
