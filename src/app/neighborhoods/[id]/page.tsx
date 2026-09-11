import { db } from "@/db";
import {
  neighborhoods,
  schools,
  schoolNeighborhoods,
  childcareOptions,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NeighborhoodDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const neighborhoodId = Number(params.id);
  const [neighborhood] = await db
    .select()
    .from(neighborhoods)
    .where(eq(neighborhoods.id, neighborhoodId))
    .limit(1);
  if (!neighborhood) notFound();

  const links = await db
    .select()
    .from(schoolNeighborhoods)
    .where(eq(schoolNeighborhoods.neighborhoodId, neighborhoodId));
  const schoolIds = links.map((l) => l.schoolId);
  const linkedSchools = schoolIds.length
    ? await db.select().from(schools).where(inArray(schools.id, schoolIds))
    : [];

  const linkedChildcare = await db
    .select()
    .from(childcareOptions)
    .where(eq(childcareOptions.neighborhoodId, neighborhoodId));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl">{neighborhood.name}</h2>
        {neighborhood.borough && (
          <p className="text-ink/60">{neighborhood.borough}</p>
        )}
        {neighborhood.notes && <p className="mt-2">{neighborhood.notes}</p>}
      </div>

      <div>
        <h3 className="font-display text-lg mb-3">Schools</h3>
        {linkedSchools.length === 0 ? (
          <p className="text-ink/60">No schools linked yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {linkedSchools.map((s) => (
              <li
                key={s.id}
                className="border border-line bg-white rounded px-4 py-3"
              >
                <span className="font-medium">{s.name}</span>
                {s.realEstateLink && (
                  <a
                    href={s.realEstateLink}
                    className="text-route text-sm block"
                  >
                    Real estate search
                  </a>
                )}
                {s.notes && <p className="text-ink/70 text-sm">{s.notes}</p>}
              </li>
            ))}
          </ul>
        )}
        <Link href="/schools" className="text-route text-sm block mt-2">
          Manage schools →
        </Link>
      </div>

      <div>
        <h3 className="font-display text-lg mb-3">Childcare</h3>
        {linkedChildcare.length === 0 ? (
          <p className="text-ink/60">No childcare options linked yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {linkedChildcare.map((c) => (
              <li
                key={c.id}
                className="border border-line bg-white rounded px-4 py-3"
              >
                <span className="font-medium">{c.name}</span>
                {c.link && (
                  <a href={c.link} className="text-route text-sm block">
                    Website
                  </a>
                )}
                {c.notes && <p className="text-ink/70 text-sm">{c.notes}</p>}
              </li>
            ))}
          </ul>
        )}
        <Link href="/childcare" className="text-route text-sm block mt-2">
          Manage childcare options →
        </Link>
      </div>
    </div>
  );
}
