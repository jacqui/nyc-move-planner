import { db } from "@/db";
import { neighborhoods, schools, childcareOptions, schoolNeighborhoods } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function createNeighborhood(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const borough = formData.get("borough") as string;
  const notes = formData.get("notes") as string;

  await db.insert(neighborhoods).values({ name, borough: borough || null, notes: notes || null });
  revalidatePath("/neighborhoods");
}

export default async function NeighborhoodsPage() {
  const allNeighborhoods = await db.select().from(neighborhoods);
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
              <li key={n.id}>
                <Link
                  href={`/neighborhoods/${n.id}`}
                  className="block border border-line bg-white rounded px-4 py-3 hover:border-route"
                >
                  <span className="font-medium">{n.name}</span>
                  {n.borough && <span className="text-ink/60"> — {n.borough}</span>}
                  <span className="text-ink/50 text-sm block">
                    {schoolCount} school{schoolCount === 1 ? "" : "s"} ·{" "}
                    {childcareCount} childcare option{childcareCount === 1 ? "" : "s"}
                  </span>
                </Link>
              </li>
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
