import Link from "next/link";
import { Navbar } from "@/components/navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
            Find Elite Arab-Speaking Developer Talent
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl">
            AI-powered recruitment platform connecting top refugee and female developers
            in the MENA region with companies in the Gulf and Europe.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              href="/sign-up"
              className="bg-[#1a3d2b] text-white px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Apply as Developer
            </Link>
            <Link
              href="/sign-up"
              className="border border-[#1a3d2b] text-[#1a3d2b] px-6 py-3 rounded-md font-medium hover:bg-[#f0fdf4] transition-colors"
            >
              Hire Developers →
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <span>✓ 500+ vetted developers</span>
            <span>✓ 120+ companies hiring</span>
            <span>✓ 88% match accuracy</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why TalentBridge?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🤖"
              title="AI-Powered Matching"
              description="Our AI analyses CVs and job descriptions to find the perfect match with 88% accuracy."
            />
            <FeatureCard
              icon="🎯"
              title="Curated Talent Pool"
              description="Hand-picked top developers from the MENA region — quality over quantity. We pre-screen so you don't have to."
            />
            <FeatureCard
              icon="⚡"
              title="Fast Hiring. Saved Time."
              description="Matches delivered in under 24 hours. Skip the inbox flood — get shortlisted to 2–3 ideal candidates."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to hire smarter?
        </h2>
        <p className="text-gray-500 mb-8">
          Join 120+ companies already using TalentBridge to find their next hire.
        </p>
        <Link
          href="/sign-up"
          className="bg-[#1a3d2b] text-white px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Get Started Free
        </Link>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        © 2026 TalentBridge. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
