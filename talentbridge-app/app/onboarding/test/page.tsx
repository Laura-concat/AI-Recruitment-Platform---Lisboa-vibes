"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitTest } from "@/app/actions/submitTest";
import type { TestQuestion, MCQQuestion } from "@/app/api/test/generate/route";

interface RawQuestion {
  type: "mcq" | "short";
  id: number;
  question: string;
  options?: string[];
  correct?: string;
}

export default function TechnicalTestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [rawQuestions, setRawQuestions] = useState<RawQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; feedback: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/test/generate", { method: "POST", cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setQuestions(data.questions);
        setRawQuestions(data.rawQuestions);
        setLoading(false);
      })
      .catch(() => setError("Failed to generate questions. Please try again."));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitTest(rawQuestions, answers);
      setResult(res);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
          className="bg-[#1a3d2b] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-6">{result.passed ? "🎉" : "💪"}</div>
          <div className={`text-6xl font-bold mb-2 ${result.passed ? "text-[#1a3d2b]" : "text-amber-500"}`}>
            {result.score}%
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {result.passed ? "You passed!" : "Not quite there yet"}
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">{result.feedback}</p>

          {result.passed ? (
            <Link
              href="/profile"
              className="bg-[#1a3d2b] text-white px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              View your profile →
            </Link>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => { setResult(null); setAnswers({}); setLoading(true); setQuestions([]); setRawQuestions([]);
                  fetch("/api/test/generate", { method: "POST", cache: "no-store" })
                    .then((r) => r.json())
                    .then((data) => { setQuestions(data.questions); setRawQuestions(data.rawQuestions); setLoading(false); });
                }}
                className="w-full bg-[#1a3d2b] text-white px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                Retake the test
              </button>
              <Link
                href="/profile"
                className="block w-full border border-gray-300 text-gray-600 px-8 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors text-center"
              >
                View my profile anyway
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <span className="w-8 h-8 rounded-full border-2 border-[#1a3d2b] border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500">Generating your personalised technical assessment…</p>
      </div>
    );
  }

  const answered = Object.keys(answers).length;
  const total = questions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-[#1a3d2b] font-bold text-lg">CONCAT Recruit</Link>
          <span className="text-sm text-gray-500">
            {answered}/{total} answered
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Technical Assessment</h1>
          <p className="text-sm text-gray-500">
            Answer all {total} questions to complete your assessment. This helps us ensure only the
            best developers are featured on the platform. Take your time — there is no time limit.
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-[#1a3d2b] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(answered / total) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-[#1a3d2b] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">{q.question}</p>
              </div>

              {q.type === "mcq" ? (
                <div className="space-y-2 pl-10">
                  {(q as MCQQuestion).options.map((opt) => {
                    const letter = opt.charAt(0);
                    const selected = answers[q.id] === letter;
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selected
                            ? "border-[#1a3d2b] bg-[#f0fdf4]"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={letter}
                          checked={selected}
                          onChange={() => setAnswers({ ...answers, [q.id]: letter })}
                          className="accent-[#1a3d2b]"
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="pl-10">
                  <textarea
                    rows={4}
                    placeholder="Write your answer here…"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] resize-none"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="pt-2 pb-10">
            <button
              type="submit"
              disabled={submitting || answered < total}
              className="w-full bg-[#1a3d2b] text-white py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              {submitting ? "Scoring your answers…" : answered < total ? `Answer all questions to submit (${total - answered} remaining)` : "Submit Assessment →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
