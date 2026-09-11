import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  date,
  boolean,
} from "drizzle-orm/pg-core";

// The two of you. No self-signup — accounts are seeded directly (see db:seed).
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
});

// A named plan — e.g. "Job offer fast-track" or "Standard pace" —
// with one target arrival date that milestone dates are calculated from.
export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  arrivalDate: date("arrival_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// The reusable default sequence (house sale, packing, school enrollment
// deadlines, etc.) that a new scenario is seeded from. offsetDays is
// relative to arrival: -60 means "60 days before arrival".
export const milestoneTemplates = pgTable("milestone_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  offsetDays: integer("offset_days").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// A milestone inside one scenario. computedDate is derived from the
// scenario's arrival date + template offset at creation time;
// overrideDate, when set, wins over it for display and sorting.
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id")
    .references(() => scenarios.id, { onDelete: "cascade" })
    .notNull(),
  templateId: integer("template_id").references(() => milestoneTemplates.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  computedDate: date("computed_date").notNull(),
  overrideDate: date("override_date"),
  done: boolean("done").notNull().default(false),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
});
