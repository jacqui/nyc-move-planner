import { db } from "@/db";
import { scenarios, milestoneTemplates, milestones } from "@/db/schema";
import { addDays } from "@/lib/dates";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function createScenario(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const arrivalDate = formData.get("arrivalDate") as string;

  const [scenario] = await db
    .insert(scenarios)
    .values({ name, arrivalDate })
    .returning();

  const templates = await db.select().from(milestoneTemplates);
  if (templates.length > 0) {
    await db.insert(milestones).values(
      templates.map((t) => ({
        scenarioId: scenario.id,
        templateId: t.id,
        name: t.name,
        computedDate: addDays(arrivalDate, t.offsetDays),
        sortOrder: t.sortOrder,
      }))
    );
  }

  revalidatePath("/scenarios");
}

export default async function ScenariosPage() {
  const allScenarios = await db.select().from(scenarios);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl mb-4">Scenarios</h2>
        {allScenarios.length === 0 && (
          <p className="text-ink/70 mb-4">No scenarios yet — add your first one below.</p>
        )}
        <ul className="flex flex-col gap-2">
          {allScenarios.map((s) => (
            <li key={s.id}>
              <Link
                href={`/scenarios/${s.id}`}
                className="block border border-line bg-white rounded px-4 py-3 hover:border-route"
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-ink/60"> — arriving {s.arrivalDate}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="font-display text-lg mb-3">New scenario</h3>
        <form action={createScenario} className="flex flex-col gap-3 max-w-sm">
          <input
            name="name"
            placeholder="Scenario name"
            required
            className="border border-line bg-white px-3 py-2 rounded"
          />
          <label className="flex flex-col gap-1 text-sm text-ink/70">
            Target arrival date
            <input
              name="arrivalDate"
              type="date"
              required
              className="border border-line bg-white px-3 py-2 rounded text-ink"
            />
          </label>
          <button
            type="submit"
            className="bg-route text-white px-3 py-2 rounded font-medium"
          >
            Create scenario
          </button>
        </form>
      </div>
    </div>
  );
}
