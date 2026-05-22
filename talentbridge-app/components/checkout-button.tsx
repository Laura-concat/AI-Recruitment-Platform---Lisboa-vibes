"use client";

import { useTransition } from "react";
import { createCheckoutSession } from "@/app/actions/createCheckoutSession";

interface CheckoutButtonProps {
  plan: "basic" | "pro";
  label: string;
  className: string;
}

export function CheckoutButton({ plan, label, className }: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(() => createCheckoutSession(formData));
      }}
    >
      <input type="hidden" name="plan" value={plan} />
      <button type="submit" disabled={isPending} className={className}>
        {isPending ? "Redirecting..." : label}
      </button>
    </form>
  );
}
