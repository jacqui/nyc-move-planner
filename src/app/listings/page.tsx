import { db } from "@/db";
import { listings, neighborhoods } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NewListingForm } from "./NewListingForm";
import { EditableListing } from "./EditableListing";

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

async function updateListing(id: number, formData: FormData) {
  "use server";
  const url = (formData.get("url") as string) || null;
  const address = formData.get("address") as string;
  const price = (formData.get("price") as string) || null;
  const imageUrl = (formData.get("imageUrl") as string) || null;
  const status = formData.get("status") as string;
  const notes = (formData.get("notes") as string) || null;
  const neighborhoodIdRaw = formData.get("neighborhoodId") as string;
  const neighborhoodId = neighborhoodIdRaw ? Number(neighborhoodIdRaw) : null;

  await db
    .update(listings)
    .set({ url, address, price, imageUrl, status, notes, neighborhoodId })
    .where(eq(listings.id, id));

  revalidatePath("/listings");
}

async function deleteListing(id: number) {
  "use server";
  await db.delete(listings).where(eq(listings.id, id));
  revalidatePath("/listings");
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { status?: string; neighborhoodId?: string };
}) {
  const allNeighborhoods = await db.select().from(neighborhoods).orderBy(asc(neighborhoods.name));

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
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(listings.address));

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
            {filtered.map((l) => (
              <EditableListing
                key={l.id}
                listing={l}
                allNeighborhoods={allNeighborhoods}
                updateListing={updateListing}
                deleteListing={deleteListing}
              />
            ))}
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
