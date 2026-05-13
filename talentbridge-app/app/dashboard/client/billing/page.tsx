import Link from "next/link";
import { Navbar } from "@/components/navbar";

const invoices = [
  { id: "INV-2026-005", date: "1 May 2026", amount: "$299.00", status: "Paid" },
  { id: "INV-2026-004", date: "1 Apr 2026", amount: "$299.00", status: "Paid" },
  { id: "INV-2026-003", date: "1 Mar 2026", amount: "$299.00", status: "Paid" },
  { id: "INV-2026-002", date: "1 Feb 2026", amount: "$299.00", status: "Paid" },
];

export default function ClientBillingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Billing & Subscription</h1>

        {/* Current plan */}
        <div className="bg-white border-2 border-[#1a3d2b] rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-[#1a3d2b] bg-[#f0fdf4] px-2 py-0.5 rounded-full">
                Current Plan
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">Professional</h2>
              <p className="text-sm text-gray-500">$299 / month · Renews 1 June 2026</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-[#f0fdf4] text-[#1a3d2b] text-xs font-medium px-3 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-0.5">Job postings</p>
              <p className="font-semibold text-gray-900">3 / 5 used</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Introductions</p>
              <p className="font-semibold text-gray-900">1 / 2 used this month</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Candidate matches</p>
              <p className="font-semibold text-gray-900">8 total</p>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <Link
              href="/pricing"
              className="text-sm border border-[#1a3d2b] text-[#1a3d2b] px-4 py-2 rounded-md hover:bg-[#f0fdf4] transition-colors"
            >
              Upgrade to Enterprise
            </Link>
            <button className="text-sm border border-gray-300 text-gray-500 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
              Cancel Subscription
            </button>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-gray-900 rounded text-white flex items-center justify-center text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Visa ending in 4242</p>
                <p className="text-xs text-gray-400">Expires 09/2028</p>
              </div>
            </div>
            <button className="text-sm text-[#1a3d2b] hover:underline">Update</button>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Invoice History</h3>
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.id}</p>
                  <p className="text-xs text-gray-400">{inv.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">{inv.amount}</span>
                  <span className="text-xs bg-[#f0fdf4] text-[#1a3d2b] px-2 py-0.5 rounded-full">{inv.status}</span>
                  <button className="text-xs text-gray-400 hover:text-[#1a3d2b]">Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
