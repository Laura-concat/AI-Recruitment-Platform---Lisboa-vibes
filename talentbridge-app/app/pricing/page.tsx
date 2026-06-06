import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { CheckoutButton } from "@/components/checkout-button";
import { Footer } from "@/components/footer";

const plans = [
  {
    name: "Starter",
    price: "$99",
    period: "/ month",
    description: "Perfect for startups making their first technical hire.",
    features: [
      "1 active job posting",
      "Up to 3 AI-matched candidates",
      "Full candidate profiles",
      "Email support",
      "No introductions included",
      "No shortlisting service",
    ],
    cta: "Get Started",
    plan: "basic" as const,
    popular: false,
  },
  {
    name: "Professional",
    price: "$299",
    period: "/ month",
    description: "For growing teams who need to hire fast and smart.",
    features: [
      "5 active job postings",
      "Up to 15 AI-matched candidates",
      "Full candidate profiles",
      "Priority support",
      "2 managed introductions / month",
      "Feedback & rating system",
      "Monthly hiring report",
      "30-day money-back guarantee",
    ],
    cta: "Start Hiring Now →",
    plan: "pro" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom pricing",
    period: "",
    description: "For organisations scaling their tech teams across MENA.",
    features: [
      "Unlimited job postings",
      "Unlimited candidate matches",
      "Dedicated account manager",
      "Intro & interview coordination",
      "Candidate onboarding support",
      "Invoiced billing available",
      "Volume discounts",
    ],
    cta: "Contact Sales →",
    ctaHref: "/contact",
    popular: false,
  },
];

interface SampleProfile {
  initials: string;
  name: string;
  title: string;
  location: string;
  remote: string;
  experienceYears: number;
  skills: string[];
  matchScore: number;
  color: string;
}

function getSeniority(years: number): { label: string; className: string } {
  if (years >= 6) return { label: "Senior", className: "bg-purple-100 text-purple-700" };
  if (years >= 3) return { label: "Mid-level", className: "bg-blue-100 text-blue-700" };
  return { label: "Junior", className: "bg-amber-100 text-amber-700" };
}

const sampleProfiles: SampleProfile[] = [
  {
    initials: "LM",
    name: "Leila M.",
    title: "Full-Stack Developer",
    location: "Beirut, Lebanon",
    remote: "Remote-ready",
    experienceYears: 5,
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
    matchScore: 94,
    color: "bg-[#1a3d2b]",
  },
  {
    initials: "SA",
    name: "Sara A.",
    title: "React Native Developer",
    location: "Amman, Jordan",
    remote: "Remote · Hybrid",
    experienceYears: 4,
    skills: ["React Native", "TypeScript", "Firebase", "GraphQL"],
    matchScore: 88,
    color: "bg-blue-700",
  },
  {
    initials: "KH",
    name: "Khalid H.",
    title: "Backend Engineer",
    location: "Cairo, Egypt",
    remote: "Remote-first",
    experienceYears: 7,
    skills: ["Python", "Django", "FastAPI", "PostgreSQL", "Docker"],
    matchScore: 91,
    color: "bg-purple-700",
  },
  {
    initials: "NM",
    name: "Nour M.",
    title: "Frontend Developer",
    location: "Cairo, Egypt",
    remote: "Open to relocation",
    experienceYears: 2,
    skills: ["React", "Vue.js", "JavaScript", "CSS", "Figma"],
    matchScore: 82,
    color: "bg-amber-700",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" />

      {/* Sample profiles teaser */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <span className="inline-block bg-[#f0fdf4] text-[#1a3d2b] text-sm font-medium px-3 py-1 rounded-full mb-4">
              A Taste of the Talent
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Meet the developers waiting to work with you
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Every profile on CONCAT Recruit is hand-vetted. Here's a sample of the
              kind of talent you'll be matched with — full profiles unlock when you subscribe.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {sampleProfiles.map((profile) => (
              <SampleProfileCard key={profile.initials} profile={profile} />
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              500+ vetted developers · Updated weekly · Arabic &amp; English speaking
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center mb-12">
          <span className="inline-block bg-[#f0fdf4] text-[#1a3d2b] text-sm font-medium px-3 py-1 rounded-full mb-4">
            For Companies &amp; Clients
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Simple. Transparent Pricing.
          </h1>
          <p className="text-gray-500 mb-4">
            Unlock full profiles, AI matching, and direct introductions.
          </p>
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600">
            <span>Are you a developer?</span>
            <Link href="/for-developers" className="text-[#1a3d2b] font-medium hover:underline">
              Joining is completely free →
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 relative ${
                plan.popular
                  ? "border-[#1a3d2b] shadow-md"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a3d2b] text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <h2 className="font-bold text-gray-900 mb-1">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-gray-400 text-sm">{plan.period}</span>}
              </div>
              <p className="text-sm text-gray-500 mb-5">{plan.description}</p>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-[#1a3d2b] mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.plan ? (
                <CheckoutButton
                  plan={plan.plan}
                  label={plan.cta}
                  className={`block w-full text-center py-2.5 rounded-md text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60 ${
                    plan.popular
                      ? "bg-[#1a3d2b] text-white"
                      : "border border-[#1a3d2b] text-[#1a3d2b] hover:bg-[#f0fdf4]"
                  }`}
                />
              ) : (
                <Link
                  href={"ctaHref" in plan ? plan.ctaHref : "/pricing"}
                  className="block w-full text-center py-2.5 rounded-md text-sm font-medium transition-opacity hover:opacity-90 border border-[#1a3d2b] text-[#1a3d2b] hover:bg-[#f0fdf4]"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-10">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
      </div>

      <Footer />
    </div>
  );
}

function SampleProfileCard({ profile }: { profile: SampleProfile }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 relative overflow-hidden">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full ${profile.color} text-white font-bold text-sm flex items-center justify-center flex-shrink-0`}>
          {profile.initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="font-semibold text-gray-900">{profile.name}</h3>
            <span className="text-xs font-bold text-[#1a3d2b] bg-[#f0fdf4] px-2 py-0.5 rounded-full">
              {profile.matchScore}% Fit
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-gray-600">{profile.title}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSeniority(profile.experienceYears).className}`}>
              {getSeniority(profile.experienceYears).label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {profile.location} · {profile.remote} · {profile.experienceYears} yrs exp
          </p>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Locked overlay hint */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">Full profile, contact info &amp; AI analysis</span>
        <span className="text-xs font-medium text-[#1a3d2b] flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Unlocks with subscription
        </span>
      </div>
    </div>
  );
}
