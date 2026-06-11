import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const testimonials = [
  {
    quote:
      "Collaborating with CONCAT has been incredibly beneficial for us at Equevu. Their expertise in tech recruitment has provided us with skilled candidates who fit our criteria. We're impressed with the quality of talent they recommend, making our hiring process much smoother and more effective. I'd definitely recommend CONCAT to any company seeking reliable tech recruitment services.",
    name: "Equevu Team",
    role: "Hiring Manager",
    company: "Equevu",
    location: "",
    initials: "EQ",
  },
  {
    quote:
      "Working with CONCAT Recruit, we were super impressed by the talent pool in their community. Their innovative approach of reaching refugee and female developers is awesome.",
    name: "Client",
    role: "Tech Lead",
    company: "CONCAT Partner",
    location: "",
    initials: "CP",
  },
  {
    quote:
      "CONCAT met our expectations with their seamless process and prompt delivery of CVs for Java developers. Their efficiency made the hiring process smooth and hassle-free. Laura, our contact person at CONCAT, was very responsive and helpful.",
    name: "Hiring Team",
    role: "Engineering Manager",
    company: "CONCAT Client",
    location: "",
    initials: "CC",
  },
];

const partnerLogos = [
  { name: "Fintech Saudi", abbr: "FS" },
  { name: "Loops Ventures", abbr: "LV" },
  { name: "NovaTech MENA", abbr: "NT" },
  { name: "Gulf Digital", abbr: "GD" },
  { name: "Cedar Labs", abbr: "CL" },
  { name: "Astra Systems", abbr: "AS" },
];

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
              href="/for-developers"
              className="bg-[#1a3d2b] text-white px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Apply as Developer
            </Link>
            <Link
              href="/pricing"
              className="border border-[#1a3d2b] text-[#1a3d2b] px-6 py-3 rounded-md font-medium hover:bg-[#f0fdf4] transition-colors"
            >
              Hire Developers →
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <span>✓ 500+ vetted developers</span>
            <span>✓ 120+ companies hiring</span>
            <span>✓ Only 8% of applicants accepted</span>
          </div>
        </div>
      </section>

      {/* Partner logos */}
      <section className="border-y border-gray-100 py-10">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-8">
            Trusted by leading companies across the MENA region
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {partnerLogos.map((logo) => (
              <div
                key={logo.name}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 bg-gray-50"
                title={logo.name}
              >
                <span className="w-7 h-7 rounded-md bg-[#1a3d2b] text-white text-xs font-bold flex items-center justify-center">
                  {logo.abbr}
                </span>
                <span className="text-sm font-medium text-gray-600">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why CONCAT Recruit?
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
              description="We accept just 8% of applicants — so every developer you see has already cleared our technical bar. Quality over quantity, always."
            />
            <FeatureCard
              icon="⚡"
              title="Fast Hiring. Saved Time."
              description="Matches delivered in under 24 hours. Skip the inbox flood — get shortlisted to 2–3 ideal candidates."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          What our clients say
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-lg mx-auto">
          Companies across the Gulf and Europe trust CONCAT Recruit to find the right technical talent, fast.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col">
              <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a3d2b] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role} · {t.company} · {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-20 text-center">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to hire smarter?
          </h2>
          <p className="text-gray-500 mb-8">
            Join 120+ companies already using CONCAT Recruit to find their next hire.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/pricing"
              className="bg-[#1a3d2b] text-white px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              View Plans & Pricing
            </Link>
            <Link
              href="/for-developers"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md font-medium hover:bg-white transition-colors"
            >
              Apply as a Developer
            </Link>
          </div>
        </div>
      </section>

      <Footer />
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
