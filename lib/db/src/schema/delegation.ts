import { pgTable, text, integer, boolean, bigint, timestamp } from "drizzle-orm/pg-core";

export const delegationChallenges = pgTable("delegation_challenges", {
  nonce: text("nonce").primaryKey(),
  permissionsContext: text("permissions_context").notNull(),
  delegatorAddress: text("delegator_address").notNull(),
  createdAt: integer("created_at").notNull(),
  used: boolean("used").notNull().default(false),
});

export const delegationContextOwners = pgTable("delegation_context_owners", {
  contextKey: text("context_key").primaryKey(),
  owner: text("owner").notNull(),
  registeredAt: integer("registered_at").notNull(),
});

export const delegationRateLimits = pgTable("delegation_rate_limits", {
  contextKey: text("context_key").primaryKey(),
  count: integer("count").notNull().default(1),
  windowStart: bigint("window_start", { mode: "number" }).notNull(),
});

export const delegationIdempotency = pgTable("delegation_idempotency", {
  key: text("key").primaryKey(),
  txHash: text("tx_hash").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});
