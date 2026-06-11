import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "For Developers — CONCAT Recruit",
  description:
    "Get discovered by top companies in the Gulf and Europe. Upload your CV, build a verified profile, and let AI match you to the right role.",
};

export default function ForDevelopersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <span className="inline-block bg-[#f0fdf4] text-[#1a3d2b] text-sm font-medium px-3 py-1 rounded-full mb-4">
            For Arab-Speaking Developers
          </span>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
            Get Hired by the Best Companies in the Region
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl">
            Upload your CV once. Our AI builds your profile, highlights your skills, and
            matches you to companies actively looking for exactly what you bring.
            No job boards. No spam. Just the right opportunities.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              href="/sign-up"
              className="bg-[#1a3d2b] text-white px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Apply Now — It's Free
            </Link>
            <Link
              href="#how-it-works"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              How it works →
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <span>✓ Free for developers</span>
            <span>✓ Only vetted companies</span>
            <span>✓ Arabic & English supported</span>
            <span>✓ Only top 8% are accepted</span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Join CONCAT Recruit?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard
              icon="🎯"
              title="Matched to the Right Role"
              description="Our AI reads your CV and matches you only to companies whose requirements fit your actual skills — no wasted applications."
            />
            <BenefitCard
              icon="🌍"
              title="Reach Gulf & European Companies"
              description="Get in front of start-ups and SMEs in the UAE, Saudi Arabia, Qatar, and Europe who are actively seeking Arab-speaking developers."
            />
            <BenefitCard
              icon="✅"
              title="Verified & Trusted"
              description="We accept only 8% of applicants. Getting on CONCAT Recruit is a signal of quality — companies know they're seeing the best of the best."
            />
            <BenefitCard
              icon="🔒"
              title="You Control Your Profile"
              description="Your profile is private by default. You decide when you're visible and which opportunities to pursue."
            />
            <BenefitCard
              icon="⚡"
              title="No Lengthy Applications"
              description="Upload your CV once. We handle the rest — no endless forms, cover letters, or follow-up emails required."
            />
            <BenefitCard
              icon="💬"
              title="Direct Introductions"
              description="When a company wants to meet you, we make the introduction. No cold calls — only warm, relevant connections."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          How It Works
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          Three steps to get discovered by companies that are the right fit.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Step
            number="1"
            title="Upload Your CV"
            description="Drop your CV in PDF or DOCX format. Our AI extracts your skills, experience, and seniority automatically."
          />
          <Step
            number="2"
            title="Review Your Profile"
            description="Check your AI-generated profile, add any missing details, and set your visibility when you're ready."
          />
          <Step
            number="3"
            title="Get Matched & Introduced"
            description="When a company posts a role that fits, you'll be shortlisted. We'll notify you and make the introduction."
          />
        </div>
      </section>

      {/* Apply CTA after How It Works */}
      <div className="text-center py-10">
        <Link
          href="/sign-up"
          className="bg-[#1a3d2b] text-white px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Apply Now — It's Free
        </Link>
      </div>

      {/* Who we're looking for */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Who We're Looking For
            </h2>
            <p className="text-gray-500 mb-8">
              We accept just 8% of applicants. If you make it through, you join an
              exclusive pool of elite Arab-speaking developers — and companies come to you.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <CriteriaCard
              title="Arab-Speaking Developers"
              items={[
                "Full-stack, front-end, or back-end engineers",
                "Mobile developers (iOS / Android / React Native)",
                "CTOs and senior technical leads",
                "Product and project managers with a technical background",
              ]}
            />
            <CriteriaCard
              title="We Especially Support"
              items={[
                "Refugee developers from the MENA region",
                "Female developers seeking opportunities in tech",
                "Developers based in Lebanon, Jordan, Egypt, Iraq, and beyond",
                "Candidates open to remote or relocation roles",
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to be discovered?
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          It takes less than 5 minutes to upload your CV and create your profile. It's completely free.
        </p>
        <Link
          href="/sign-up"
          className="bg-[#1a3d2b] text-white px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Apply as a Developer
        </Link>
      </section>

      <Footer />
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-[#1a3d2b] text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function CriteriaCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
            <span className="text-[#1a3d2b] mt-0.5">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
