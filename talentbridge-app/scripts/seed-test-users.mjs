// Creates two test users in Clerk + the local DB (one candidate, one client).
// Run: node --env-file=.env.local scripts/seed-test-users.mjs

import { createClerkClient } from "@clerk/backend";
import { neon } from "@neondatabase/serverless";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const sql = neon(process.env.DATABASE_URL);

const TEST_USERS = [
  {
    firstName: "Test",
    lastName: "Candidate",
    email: "testcandidate@example.com",
    password: "TalentBridge2026!",
    role: "candidate",
  },
  {
    firstName: "Test",
    lastName: "Client",
    email: "testclient@example.com",
    password: "TalentBridge2026!",
    role: "client",
  },
];

for (const u of TEST_USERS) {
  console.log(`\nProcessing ${u.role}: ${u.email}`);

  // Check if user already exists in Clerk
  const existing = await clerk.users.getUserList({ emailAddress: [u.email] });
  let clerkUser;

  if (existing.data.length > 0) {
    clerkUser = existing.data[0];
    console.log(`  ↳ Already exists in Clerk (${clerkUser.id}) — updating metadata`);
    await clerk.users.updateUser(clerkUser.id, {
      unsafeMetadata: { role: u.role },
    });
  } else {
    clerkUser = await clerk.users.createUser({
      firstName: u.firstName,
      lastName: u.lastName,
      emailAddress: [u.email],
      password: u.password,
      unsafeMetadata: { role: u.role },
    });
    console.log(`  ↳ Created in Clerk (${clerkUser.id})`);
  }

  // Upsert into local DB users table
  await sql`
    INSERT INTO users (id, email, role)
    VALUES (${clerkUser.id}, ${u.email}, ${u.role})
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role
  `;
  console.log(`  ↳ Upserted into DB`);
}

console.log(`
✅ Test users ready

  Candidate
    Email:    test.candidate@talentbridge.dev
    Password: TalentBridge2026!
    Route:    /dashboard

  Client
    Email:    test.client@talentbridge.dev
    Password: TalentBridge2026!
    Route:    /dashboard/client
`);
