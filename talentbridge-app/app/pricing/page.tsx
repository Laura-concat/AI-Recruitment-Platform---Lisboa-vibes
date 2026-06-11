import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProfileCarousel } from "@/components/profile-carousel";

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
              We accept just 8% of applicants — every developer on the platform has cleared
              our technical bar. Here's a sample of what you'll be matched with.
            </p>
          </div>

          <ProfileCarousel profiles={sampleProfiles} />

          <div className="text-center">
            <p className="text-sm text-gray-400">
              500+ vetted developers · 8% acceptance rate · Updated weekly · Arabic &amp; English speaking
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
          <p className="text-gray-500 mb-6">
            Unlock full profiles, AI matching, and direct introductions.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mb-6 text-center">
            <div>
              <div className="text-2xl font-bold text-[#1a3d2b]">8%</div>
              <div className="text-xs text-gray-500 mt-0.5">applicant acceptance rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1a3d2b]">500+</div>
              <div className="text-xs text-gray-500 mt-0.5">vetted developers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1a3d2b]">3–4</div>
              <div className="text-xs text-gray-500 mt-0.5">AI matches per job post</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1a3d2b]">&lt;24h</div>
              <div className="text-xs text-gray-500 mt-0.5">to first match</div>
            </div>
          </div>
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

              <Link
                href="/sign-up"
                className={`block w-full text-center py-2.5 rounded-md text-sm font-medium transition-opacity hover:opacity-90 ${
                  plan.popular
                    ? "bg-[#1a3d2b] text-white"
                    : "border border-[#1a3d2b] text-[#1a3d2b] hover:bg-[#f0fdf4]"
                }`}
              >
                {plan.cta}
              </Link>
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

