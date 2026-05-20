"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { updateJob } from "@/app/actions/updateJob";

interface Props {
  jobId: string;
  initialTitle: string;
  initialDescription: string;
  initialEmploymentType: string;
  initialLocation: string;
  initialCountry: string;
  initialCity: string;
  initialSkills: string[];
  initialDeadline: string;
}

export default function EditJobForm({
  jobId,
  initialTitle,
  initialDescription,
  initialEmploymentType,
  initialLocation,
  initialCountry,
  initialCity,
  initialSkills,
  initialDeadline,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [employmentType, setEmploymentType] = useState(initialEmploymentType);
  const [location, setLocation] = useState(initialLocation);
  const [country, setCountry] = useState(initialCountry);
  const [city, setCity] = useState(initialCity);
  const [deadline, setDeadline] = useState(initialDeadline);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("jobId", jobId);
      formData.set("title", title);
      formData.set("description", description);
      formData.set("employmentType", employmentType);
      formData.set("location", location);
      formData.set("country", country);
      formData.set("city", city);
      formData.set("applyDeadline", deadline);

      const result = await updateJob(formData);
      if ("error" in result) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setSaved(true);
      setTimeout(() => {
        router.push("/dashboard/client");
      }, 800);
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
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard/client")}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Job</h1>
        <p className="text-sm text-gray-500 mb-6">
          Update the details below — skills and requirements will be re-extracted from the description.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-4 bg-[#f0fdf4] border border-[#bbf7d0] text-[#1a3d2b] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span>✓</span> Job updated successfully. Redirecting…
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior React Developer"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Employment Type
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
                  Location
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Job Description *
              </label>
              <textarea
                rows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, responsibilities, required skills, and years of experience..."
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Skills and requirements will be re-extracted automatically when you save.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/client")}
                className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || saved}
                className="flex-1 bg-[#1a3d2b] text-white py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                )}
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Skills sidebar */}
          {initialSkills.length > 0 && (
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-5 h-fit">
              <h3 className="font-semibold text-[#1a3d2b] mb-3 text-sm">Currently extracted skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {initialSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-white text-[#1a3d2b] border border-[#bbf7d0] px-2 py-0.5 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Skills update automatically when you save with an edited description.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
