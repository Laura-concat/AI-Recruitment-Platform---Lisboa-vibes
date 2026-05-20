import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

interface ClerkUserCreatedEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    public_metadata: { role?: "candidate" | "client" };
    unsafe_metadata: { role?: "candidate" | "client" };
  };
}

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await request.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkUserCreatedEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserCreatedEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (event.type !== "user.created") {
    return new Response("OK", { status: 200 });
  }

  const { id, email_addresses, public_metadata, unsafe_metadata } = event.data;
  const email = email_addresses[0]?.email_address;
  const role = public_metadata?.role ?? unsafe_metadata?.role ?? "candidate";

  if (!email) {
    return new Response("No email address found", { status: 400 });
  }

  await db
    .insert(users)
    .values({ id, email, role })
    .onConflictDoNothing({ target: users.id });

  return new Response("OK", { status: 200 });
}
