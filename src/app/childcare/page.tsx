import { db } from "@/db";
import { childcareOptions, neighborhoods } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { EditableChildcare } from "./EditableChildcare";

export const dynamic = "force-dynamic";

async function createChildcare(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const notes = formData.get("notes") as string;
  const link = formData.get("link") as string;
  const neighborhoodIdRaw = formData.get("neighborhoodId") as string;
  const neighborhoodId = neighborhoodIdRaw ? Number(neighborhoodIdRaw) : null;

  await db.insert(childcareOptions).values({
    name,
    notes: notes || null,
    link: link || null,
    neighborhoodId,
  });

  revalidatePath("/childcare");
}

async function updateChildcare(id: number, formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const notes = formData.get("notes") as string;
  const link = formData.get("link") as string;
  const neighborhoodIdRaw = formData.get("neighborhoodId") as string;
  const neighborhoodId = neighborhoodIdRaw ? Number(neighborhoodIdRaw) : null;

  await db
    .update(childcareOptions)
    .set({ name, notes: notes || null, link: link || null, neighborhoodId })
    .where(eq(childcareOptions.id, id));

  revalidatePath("/childcare");
}

async function deleteChildcare(id: number) {
  "use server";
  await db.delete(childcareOptions).where(eq(childcareOptions.id, id));
  revalidatePath("/childcare");
}

export default async function ChildcarePage() {
  const allChildcare = await db.select().from(childcareOptions).orderBy(asc(childcareOptions.name));
  const allNeighborhoods = await db.select().from(neighborhoods).orderBy(asc(neighborhoods.name));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl mb-4">Childcare</h2>
        {allChildcare.length === 0 && (
          <p className="text-ink/70 mb-4">No childcare options yet — add your first one below.</p>
        )}
        <ul className="flex flex-col gap-2">
          {allChildcare.map((c) => (
            <EditableChildcare
              key={c.id}
              childcare={c}
              allNeighborhoods={allNeighborhoods}
              updateChildcare={updateChildcare}
              deleteChildcare={deleteChildcare}
            />
          ))}
        </ul>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="font-display text-lg mb-3">New childcare option</h3>
        <form action={createChildcare} className="flex flex-col gap-3 max-w-sm">
          <input
            name="name"
            placeholder="Childcare name"
            required
            className="border border-line bg-white px-3 py-2 rounded"
          />
          <select
            name="neighborhoodId"
            className="border border-line bg-white px-3 py-2 rounded"
            defaultValue=""
          >
            <option value="">No neighborhood selected</option>
            {allNeighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
          <input
            name="link"
            placeholder="Website (optional)"
            className="border border-line bg-white px-3 py-2 rounded"
          />
          <textarea
            name="notes"
            placeholder="Notes (optional)"
            className="border border-line bg-white px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="bg-route text-white px-3 py-2 rounded font-medium"
          >
            Add childcare option
          </button>
        </form>
      </div>
    </div>
  );
}
