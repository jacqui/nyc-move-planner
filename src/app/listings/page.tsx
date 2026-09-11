import { db } from "@/db";
import { listings, neighborhoods } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NewListingForm } from "./NewListingForm";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  for_sale: "For sale",
  for_rent: "For rent",
  sold: "Sold",
};

async function createListing(formData: FormData) {
  "use server";
  const url = (formData.get("url") as string) || null;
  const address = formData.get("address") as string;
  const price = (formData.get("price") as string) || null;
  const imageUrl = (formData.get("imageUrl") as string) || null;
  const status = formData.get("status") as string;
  const notes = (formData.get("notes") as string) || null;
  const neighborhoodIdRaw = formData.get("neighborhoodId") as string;
  const neighborhoodId = neighborhoodIdRaw ? Number(neighborhoodIdRaw) : null;

  await db.insert(listings).values({
    url,
    address,
    price,
    imageUrl,
    status,
    notes,
    neighborhoodId,
  });

  revalidatePath("/listings");
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { status?: string; neighborhoodId?: string };
}) {
  const allNeighborhoods = await db.select().from(neighborhoods);

  const conditions = [];
  if (searchParams.status) {
    conditions.push(eq(listings.status, searchParams.status));
  }
  if (searchParams.neighborhoodId) {
    conditions.push(
      eq(listings.neighborhoodId, Number(searchParams.neighborhoodId))
    );
  }

  const filtered = await db
    .select()
    .from(listings)
    .where(conditions.length ? and(...conditions) : undefined);

  function filterHref(status?: string, neighborhoodId?: string) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (neighborhoodId) params.set("neighborhoodId", neighborhoodId);
    const qs = params.toString();
    return qs ? `/listings?${qs}` : "/listings";
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl mb-4">Listings</h2>

        <div className="flex flex-wrap gap-2 mb-4 text-sm">
          <a
            href={filterHref(undefined, searchParams.neighborhoodId)}
            className={`px-3 py-1 rounded border ${
              !searchParams.status ? "border-route text-route" : "border-line"
            }`}
          >
            All statuses
          </a>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <a
              key={value}
              href={filterHref(value, searchParams.neighborhoodId)}
              className={`px-3 py-1 rounded border ${
                searchParams.status === value
                  ? "border-route text-route"
                  : "border-line"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4 text-sm">
          <a
            href={filterHref(searchParams.status, undefined)}
            className={`px-3 py-1 rounded border ${
              !searchParams.neighborhoodId
                ? "border-route text-route"
                : "border-line"
            }`}
          >
            All neighborhoods
          </a>
          {allNeighborhoods.map((n) => (
            <a
              key={n.id}
              href={filterHref(searchParams.status, String(n.id))}
              className={`px-3 py-1 rounded border ${
                searchParams.neighborhoodId === String(n.id)
                  ? "border-route text-route"
                  : "border-line"
              }`}
            >
              {n.name}
            </a>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-ink/70">No listings match — add one below.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((l) => {
              const neighborhoodName = allNeighborhoods.find(
                (n) => n.id === l.neighborhoodId
              )?.name;
              return (
                <li
                  key={l.id}
                  className="border border-line bg-white rounded px-4 py-3 flex gap-3"
                >
                  {l.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.imageUrl}
                      alt=""
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{l.address}</span>
                      <span className="text-sm text-ink/60">
                        {STATUS_LABEL[l.status] ?? l.status}
                      </span>
                    </div>
                    {l.price && <p className="text-ink/70">{l.price}</p>}
                    {neighborhoodName && (
                      <p className="text-ink/50 text-sm">{neighborhoodName}</p>
                    )}
                    {l.notes && <p className="text-ink/70 text-sm">{l.notes}</p>}
                    {l.url && (
                      <a href={l.url} className="text-route text-sm block">
                        Original listing
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="font-display text-lg mb-3">New listing</h3>
        <NewListingForm
          neighborhoods={allNeighborhoods}
          createListing={createListing}
        />
      </div>
    </div>
  );
}
