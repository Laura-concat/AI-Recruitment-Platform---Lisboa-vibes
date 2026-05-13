import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-[#1a3d2b] font-bold text-2xl mb-10">
        TalentBridge
      </Link>

      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Join TalentBridge — Who are you?
        </h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Select your role to get started with the right experience.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Developer card */}
          <Link href="/onboarding/upload">
            <div className="border-2 border-[#1a3d2b] rounded-xl p-6 hover:bg-[#f0fdf4] transition-colors cursor-pointer">
              <div className="text-4xl mb-4">👩‍💻</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">I&apos;m a Developer</h2>
              <p className="text-sm text-gray-500 mb-6">
                Upload your CV, build your AI-powered profile, and get matched with top companies
                in the Gulf and Europe.
              </p>
              <div className="w-full bg-[#1a3d2b] text-white text-sm font-medium py-2.5 rounded-md text-center">
                Sign up as Developer
              </div>
            </div>
          </Link>

          {/* Client card */}
          <Link href="/dashboard">
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#1a3d2b] hover:bg-[#f0fdf4] transition-colors cursor-pointer">
              <div className="text-4xl mb-4">🏢</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">I&apos;m Hiring</h2>
              <p className="text-sm text-gray-500 mb-6">
                Post your job description, get AI-matched to the best Arab-speaking developers,
                and hire in under a week.
              </p>
              <div className="w-full border border-[#1a3d2b] text-[#1a3d2b] text-sm font-medium py-2.5 rounded-md text-center">
                Sign up as a Client
              </div>
            </div>
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#1a3d2b] font-medium hover:underline">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
