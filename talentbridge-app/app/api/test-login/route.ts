import { createClerkClient } from "@clerk/backend";
import { NextRequest, NextResponse } from "next/server";

const TEST_USERS: Record<string, string> = {
  candidate: "user_3E0BxBJYSfEKcuioiFGsJZ6wi12",
  client: "user_3E0BxIuUrtJcAZ3UNMNMIxnTrlM",
};

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") ?? "candidate";
  const userId = TEST_USERS[role];
  if (!userId) return NextResponse.json({ error: "Unknown role" }, { status: 400 });

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const token = await clerk.signInTokens.createSignInToken({
    userId,
    expiresInSeconds: 120,
  });

  // Use Clerk's own hosted sign-in URL — it processes the ticket natively
  return NextResponse.redirect(token.url);
}
