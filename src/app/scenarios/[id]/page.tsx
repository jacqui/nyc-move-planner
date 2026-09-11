import { db } from "@/db";
import { scenarios, milestones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { effectiveDate } from "@/lib/dates";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function updateMilestone(id: number, path: string, formData: FormData) {
  "use server";
  const overrideDate = formData.get("overrideDate") as string;
  const done = formData.get("done") === "on";

  await db
    .update(milestones)
    .set({ overrideDate: overrideDate || null, done })
    .where(eq(milestones.id, id));

  revalidatePath(path);
}

export default async function ScenarioDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const scenarioId = Number(params.id);
  const [scenario] = await db
    .select()
    .from(scenarios)
    .where(eq(scenarios.id, scenarioId))
    .limit(1);
  if (!scenario) notFound();

  const items = await db
    .select()
    .from(milestones)
    .where(eq(milestones.scenarioId, scenarioId));

  const sorted = [...items].sort((a, b) =>
    effectiveDate(a.computedDate, a.overrideDate).localeCompare(
      effectiveDate(b.computedDate, b.overrideDate)
    )
  );

  const path = `/scenarios/${scenarioId}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl">{scenario.name}</h2>
        <p className="text-ink/60">Target arrival: {scenario.arrivalDate}</p>
      </div>

      <ul className="flex flex-col gap-3">
        {sorted.map((m) => {
          const boundUpdate = updateMilestone.bind(null, m.id, path);
          return (
            <li
              key={m.id}
              className="border border-line bg-white rounded px-4 py-3"
            >
              <form action={boundUpdate} className="flex flex-wrap items-center gap-3">
                <input
                  type="checkbox"
                  name="done"
                  defaultChecked={m.done}
                  className="h-4 w-4"
                />
                <span className={m.done ? "line-through text-ink/40 flex-1" : "flex-1"}>
                  {m.name}
                </span>
                <span className="text-ink/60 text-sm">
                  {effectiveDate(m.computedDate, m.overrideDate)}
                  {m.overrideDate ? " (edited)" : ""}
                </span>
                <input
                  type="date"
                  name="overrideDate"
                  defaultValue={m.overrideDate ?? ""}
                  className="border border-line px-2 py-1 rounded text-sm"
                />
                <button
                  type="submit"
                  className="text-sm bg-paper border border-line px-2 py-1 rounded hover:border-route"
                >
                  Save
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
