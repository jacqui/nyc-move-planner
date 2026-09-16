import { db } from "@/db";
import { neighborhoods, schools, childcareOptions, schoolNeighborhoods } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { EditableNeighborhood } from "./EditableNeighborhood";

export const dynamic = "force-dynamic";

async function createNeighborhood(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const borough = formData.get("borough") as string;
  const notes = formData.get("notes") as string;

  await db.insert(neighborhoods).values({ name, borough: borough || null, notes: notes || null });
  revalidatePath("/neighborhoods");
}

async function updateNeighborhood(id: number, formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const borough = formData.get("borough") as string;
  const notes = formData.get("notes") as string;

  await db
    .update(neighborhoods)
    .set({ name, borough: borough || null, notes: notes || null })
    .where(eq(neighborhoods.id, id));
  revalidatePath("/neighborhoods");
}

async function deleteNeighborhood(id: number) {
  "use server";
  await db.delete(neighborhoods).where(eq(neighborhoods.id, id));
  revalidatePath("/neighborhoods");
}

export default async function NeighborhoodsPage() {
  const allNeighborhoods = await db.select().from(neighborhoods).orderBy(asc(neighborhoods.name));
  const allSchoolLinks = await db.select().from(schoolNeighborhoods);
  const allSchools = await db.select().from(schools);
  const allChildcare = await db.select().from(childcareOptions);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl mb-4">Neighborhoods</h2>
        {allNeighborhoods.length === 0 && (
          <p className="text-ink/70 mb-4">No neighborhoods yet — add your first one below.</p>
        )}
        <ul className="flex flex-col gap-2">
          {allNeighborhoods.map((n) => {
            const schoolIds = allSchoolLinks
              .filter((l) => l.neighborhoodId === n.id)
              .map((l) => l.schoolId);
            const schoolCount = allSchools.filter((s) => schoolIds.includes(s.id)).length;
            const childcareCount = allChildcare.filter(
              (c) => c.neighborhoodId === n.id
            ).length;

            return (
              <EditableNeighborhood
                key={n.id}
                neighborhood={n}
                schoolCount={schoolCount}
                childcareCount={childcareCount}
                updateNeighborhood={updateNeighborhood}
                deleteNeighborhood={deleteNeighborhood}
              />
            );
          })}
        </ul>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="font-display text-lg mb-3">New neighborhood</h3>
        <form action={createNeighborhood} className="flex flex-col gap-3 max-w-sm">
          <input
            name="name"
            placeholder="Neighborhood name"
            required
            className="border border-line bg-white px-3 py-2 rounded"
          />
          <input
            name="borough"
            placeholder="Borough / area (optional)"
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
            Add neighborhood
          </button>
        </form>
      </div>
    </div>
  );
}
