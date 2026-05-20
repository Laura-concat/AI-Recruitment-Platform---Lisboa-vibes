import { createClerkClient } from "@clerk/backend";
import { NextRequest, NextResponse } from "next/server";

const TEST_USERS: Record<string, string> = {
  candidate: "user_3DzSMpSK24TyTilSVnKcViOpDkf",
  client: "user_3DzSMzJalCKX9FJvgfM7j8BmSgq",
};

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") ?? "candidate";
  const userId = TEST_USERS[role];
  if (!userId) return NextResponse.json({ error: "Unknown role" }, { status: 400 });

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const token = await clerk.signInTokens.createSignInToken({
    userId,
    expiresInSeconds: 60,
  });

  // Redirect to the sign-in page with the ticket — Clerk auto-completes the sign-in
  const url = new URL("/login", req.nextUrl.origin);
  url.searchParams.set("__clerk_ticket", token.token);
  return NextResponse.redirect(url);
}
