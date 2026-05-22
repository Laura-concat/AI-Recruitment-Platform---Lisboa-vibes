import { createClerkClient } from "@clerk/backend";
import { NextRequest, NextResponse } from "next/server";

const TEST_USERS: Record<string, { userId: string; destination: string }> = {
  candidate: { userId: "user_3E0Cogz5728TsU6pmnDVaJSjsOv", destination: "/dashboard" },
  client:    { userId: "user_3E0CowZcwSfE9AILtR5TQgarZ9E", destination: "/dashboard/client" },
};

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") ?? "candidate";
  const config = TEST_USERS[role];
  if (!config) return NextResponse.json({ error: "Unknown role" }, { status: 400 });

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const token = await clerk.signInTokens.createSignInToken({
    userId: config.userId,
    expiresInSeconds: 120,
  });

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("__clerk_ticket", token.token);
  loginUrl.searchParams.set("to", config.destination);

  return NextResponse.redirect(loginUrl);
}
