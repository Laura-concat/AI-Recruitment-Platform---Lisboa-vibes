import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { CheckoutButton } from "@/components/checkout-button";

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

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" />

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Simple. Transparent Pricing.
          </h1>
          <p className="text-gray-500">
            For companies hiring Arab-speaking developers. Developers always join for free.
          </p>
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

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        © 2026 TalentBridge. All rights reserved.
      </footer>
    </div>
  );
}
