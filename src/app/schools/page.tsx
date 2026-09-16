import { db } from "@/db";
import {
  schools,
  neighborhoods,
  schoolNeighborhoods,
} from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { EditableSchool } from "./EditableSchool";

export const dynamic = "force-dynamic";

async function createSchool(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const notes = formData.get("notes") as string;
  const realEstateLink = formData.get("realEstateLink") as string;
  const neighborhoodIds = formData.getAll("neighborhoodIds").map(Number);

  const [school] = await db
    .insert(schools)
    .values({
      name,
      notes: notes || null,
      realEstateLink: realEstateLink || null,
    })
    .returning();

  if (neighborhoodIds.length > 0) {
    await db.insert(schoolNeighborhoods).values(
      neighborhoodIds.map((neighborhoodId) => ({
        schoolId: school.id,
        neighborhoodId,
      }))
    );
  }

  revalidatePath("/schools");
}

async function updateSchool(id: number, formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const notes = formData.get("notes") as string;
  const realEstateLink = formData.get("realEstateLink") as string;
  const neighborhoodIds = formData.getAll("neighborhoodIds").map(Number);

  await db
    .update(schools)
    .set({ name, notes: notes || null, realEstateLink: realEstateLink || null })
    .where(eq(schools.id, id));

  // Simplest correct approach: replace the whole link set rather than diff it.
  await db.delete(schoolNeighborhoods).where(eq(schoolNeighborhoods.schoolId, id));
  if (neighborhoodIds.length > 0) {
    await db.insert(schoolNeighborhoods).values(
      neighborhoodIds.map((neighborhoodId) => ({ schoolId: id, neighborhoodId }))
    );
  }

  revalidatePath("/schools");
  revalidatePath("/neighborhoods");
}

async function deleteSchool(id: number) {
  "use server";
  await db.delete(schools).where(eq(schools.id, id));
  revalidatePath("/schools");
  revalidatePath("/neighborhoods");
}

export default async function SchoolsPage() {
  const allSchools = await db.select().from(schools).orderBy(asc(schools.name));
  const allNeighborhoods = await db.select().from(neighborhoods).orderBy(asc(neighborhoods.name));
  const allLinks = await db.select().from(schoolNeighborhoods);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl mb-4">Schools</h2>
        {allSchools.length === 0 && (
          <p className="text-ink/70 mb-4">No schools yet — add your first one below.</p>
        )}
        <ul className="flex flex-col gap-2">
          {allSchools.map((s) => {
            const linkedNeighborhoodIds = allLinks
              .filter((l) => l.schoolId === s.id)
              .map((l) => l.neighborhoodId);
            return (
              <EditableSchool
                key={s.id}
                school={s}
                allNeighborhoods={allNeighborhoods}
                linkedNeighborhoodIds={linkedNeighborhoodIds}
                updateSchool={updateSchool}
                deleteSchool={deleteSchool}
              />
            );
          })}
        </ul>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="font-display text-lg mb-3">New school</h3>
        <form action={createSchool} className="flex flex-col gap-3 max-w-sm">
          <input
            name="name"
            placeholder="School name"
            required
            className="border border-line bg-white px-3 py-2 rounded"
          />
          <input
            name="realEstateLink"
            placeholder="Real estate search link (optional)"
            className="border border-line bg-white px-3 py-2 rounded"
          />
          <textarea
            name="notes"
            placeholder="Notes (optional)"
            className="border border-line bg-white px-3 py-2 rounded"
          />
          <fieldset className="flex flex-col gap-1">
            <legend className="text-sm text-ink/70 mb-1">Zoned neighborhoods</legend>
            {allNeighborhoods.length === 0 ? (
              <p className="text-sm text-ink/50">
                Add a neighborhood first to link one here.
              </p>
            ) : (
              allNeighborhoods.map((n) => (
                <label key={n.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="neighborhoodIds" value={n.id} />
                  {n.name}
                </label>
              ))
            )}
          </fieldset>
          <button
            type="submit"
            className="bg-route text-white px-3 py-2 rounded font-medium"
          >
            Add school
          </button>
        </form>
      </div>
    </div>
  );
}
