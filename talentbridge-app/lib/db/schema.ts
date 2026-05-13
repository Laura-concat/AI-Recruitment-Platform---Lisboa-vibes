import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  real,
  timestamp,
  json,
  index,
} from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["candidate", "client"]);

export const seniorityEnum = pgEnum("seniority_level", [
  "junior",
  "mid",
  "senior",
  "lead",
]);

export const cvStatusEnum = pgEnum("cv_status", [
  "pending",
  "processing",
  "complete",
  "failed",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "matching",
  "complete",
]);

export const matchOutcomeEnum = pgEnum("match_outcome", [
  "shortlisted",
  "interviewing",
  "hired",
  "rejected",
]);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "basic",
  "pro",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "trialing",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // matches Clerk user ID
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const candidateProfiles = pgTable(
  "candidate_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skills: text("skills").array().notNull().default([]),
    experienceYears: integer("experience_years"),
    seniorityLevel: seniorityEnum("seniority_level"),
    languages: text("languages").array().notNull().default([]),
    experienceItems: json("experience_items"),
    education: json("education"),
    summary: text("summary"),
    embedding: vector("embedding", { dimensions: 1024 }),
    isVisible: boolean("is_visible").notNull().default(true),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("candidate_profiles_user_id_idx").on(table.userId),
    index("candidate_profiles_embedding_idx").using(
      "ivfflat",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

export const cvs = pgTable(
  "cvs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fileUrl: text("file_url").notNull(),
    status: cvStatusEnum("status").notNull().default("pending"),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  },
  (table) => [
    index("cvs_user_id_idx").on(table.userId),
    index("cvs_status_idx").on(table.status),
  ]
);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    requirements: json("requirements"),
    embedding: vector("embedding", { dimensions: 1024 }),
    status: jobStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("jobs_user_id_idx").on(table.userId),
    index("jobs_embedding_idx").using(
      "ivfflat",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    candidateProfileId: uuid("candidate_profile_id")
      .notNull()
      .references(() => candidateProfiles.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    matchScore: real("match_score").notNull(),
    matchExplanation: text("match_explanation"),
    rating: integer("rating"), // 1–5, nullable
    outcome: matchOutcomeEnum("outcome"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("matches_candidate_profile_id_idx").on(table.candidateProfileId),
    index("matches_job_id_idx").on(table.jobId),
  ]
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
    tier: subscriptionTierEnum("tier").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_stripe_customer_id_idx").on(table.stripeCustomerId),
    index("subscriptions_stripe_subscription_id_idx").on(
      table.stripeSubscriptionId
    ),
  ]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  candidateProfile: one(candidateProfiles, {
    fields: [users.id],
    references: [candidateProfiles.userId],
  }),
  cvs: many(cvs),
  jobs: many(jobs),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
}));

export const candidateProfilesRelations = relations(
  candidateProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [candidateProfiles.userId],
      references: [users.id],
    }),
    matches: many(matches),
  })
);

export const cvsRelations = relations(cvs, ({ one }) => ({
  user: one(users, { fields: [cvs.userId], references: [users.id] }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  user: one(users, { fields: [jobs.userId], references: [users.id] }),
  matches: many(matches),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  candidateProfile: one(candidateProfiles, {
    fields: [matches.candidateProfileId],
    references: [candidateProfiles.id],
  }),
  job: one(jobs, { fields: [matches.jobId], references: [jobs.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));
