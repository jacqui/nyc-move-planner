import bcrypt from "bcryptjs";
import { db } from "./index";
import { users, milestoneTemplates } from "./schema";

// Edit these two accounts before running `npm run db:seed`.
const ACCOUNTS = [
  { email: "you@example.com", name: "Jacqui", password: "change-me-1" },
  { email: "husband@example.com", name: "Husband", password: "change-me-2" },
];

// Default backward-planning sequence, offset in days from arrival date.
// Edit freely — this just seeds each new scenario's starting milestones.
const DEFAULT_TEMPLATE = [
  { name: "Decide on target arrival date", offsetDays: -180, sortOrder: 0 },
  { name: "List Melbourne house with agent", offsetDays: -90, sortOrder: 1 },
  { name: "Shortlist NYC neighborhoods & schools", offsetDays: -75, sortOrder: 2 },
  { name: "Sell / settle Melbourne house", offsetDays: -60, sortOrder: 3 },
  { name: "Book movers", offsetDays: -45, sortOrder: 4 },
  { name: "Apply to primary schools", offsetDays: -45, sortOrder: 5 },
  { name: "Secure NYC housing", offsetDays: -30, sortOrder: 6 },
  { name: "Confirm childcare placement", offsetDays: -30, sortOrder: 7 },
  { name: "Engage cleaners/stagers for handover", offsetDays: -21, sortOrder: 8 },
  { name: "Shipping container departs", offsetDays: -21, sortOrder: 9 },
  { name: "Final Melbourne walkthrough", offsetDays: -3, sortOrder: 10 },
  { name: "Arrive in NYC", offsetDays: 0, sortOrder: 11 },
  { name: "School enrollment starts", offsetDays: 7, sortOrder: 12 },
];

async function main() {
  for (const account of ACCOUNTS) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    await db
      .insert(users)
      .values({ email: account.email, name: account.name, passwordHash })
      .onConflictDoNothing({ target: users.email });
  }

  for (const item of DEFAULT_TEMPLATE) {
    await db.insert(milestoneTemplates).values(item);
  }

  console.log("Seed complete. Update ACCOUNTS in src/db/seed.ts before re-running.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
