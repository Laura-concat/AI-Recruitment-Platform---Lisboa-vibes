import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import EditJobForm from "./EditJobForm";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const job = (
    await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        requirements: jobs.requirements,
        applyDeadline: jobs.applyDeadline,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.userId, userId)))
      .limit(1)
  )[0];

  if (!job) notFound();

  const reqs = job.requirements as {
    skills?: string[];
    experienceYears?: number;
    employmentType?: string;
    location?: string;
  } | null;

  // Strip the "Full-time · Remote\n\n" prefix if present
  const descBody = job.description.replace(/^[^\n]+\n\n/, "");

  const extReqs = reqs as typeof reqs & { country?: string; city?: string } | null;

  return (
    <EditJobForm
      jobId={job.id}
      initialTitle={job.title}
      initialDescription={descBody}
      initialEmploymentType={reqs?.employmentType ?? "Full-time"}
      initialLocation={reqs?.location ?? "Remote"}
      initialCountry={extReqs?.country ?? ""}
      initialCity={extReqs?.city ?? ""}
      initialSkills={reqs?.skills ?? []}
      initialDeadline={
        job.applyDeadline
          ? new Date(job.applyDeadline).toISOString().split("T")[0]
          : ""
      }
    />
  );
}
