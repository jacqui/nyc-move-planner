"use client";

import { useState } from "react";

type Listing = {
  id: number;
  url: string | null;
  address: string;
  price: string | null;
  status: string;
  imageUrl: string | null;
  neighborhoodId: number | null;
  notes: string | null;
};
type Neighborhood = { id: number; name: string };

const STATUS_LABEL: Record<string, string> = {
  for_sale: "For sale",
  for_rent: "For rent",
  sold: "Sold",
};

export function EditableListing({
  listing,
  allNeighborhoods,
  updateListing,
  deleteListing,
}: {
  listing: Listing;
  allNeighborhoods: Neighborhood[];
  updateListing: (id: number, formData: FormData) => Promise<void>;
  deleteListing: (id: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="border border-route bg-white rounded px-4 py-3">
        <form
          action={async (formData) => {
            await updateListing(listing.id, formData);
            setEditing(false);
          }}
          className="flex flex-col gap-2"
        >
          <input
            name="address"
            defaultValue={listing.address}
            required
            className="border border-line px-2 py-1 rounded"
          />
          <input
            name="price"
            defaultValue={listing.price ?? ""}
            placeholder="Price"
            className="border border-line px-2 py-1 rounded"
          />
          <input
            name="imageUrl"
            defaultValue={listing.imageUrl ?? ""}
            placeholder="Image URL"
            className="border border-line px-2 py-1 rounded"
          />
          <input
            name="url"
            defaultValue={listing.url ?? ""}
            placeholder="Original listing URL"
            className="border border-line px-2 py-1 rounded"
          />
          <select
            name="status"
            defaultValue={listing.status}
            className="border border-line px-2 py-1 rounded"
          >
            <option value="for_sale">For sale</option>
            <option value="for_rent">For rent</option>
            <option value="sold">Sold</option>
          </select>
          <select
            name="neighborhoodId"
            defaultValue={listing.neighborhoodId ?? ""}
            className="border border-line px-2 py-1 rounded"
          >
            <option value="">No neighborhood selected</option>
            {allNeighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
          <textarea
            name="notes"
            defaultValue={listing.notes ?? ""}
            placeholder="Notes"
            className="border border-line px-2 py-1 rounded"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-route text-white px-3 py-1 rounded text-sm"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="border border-line px-3 py-1 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  const neighborhoodName = allNeighborhoods.find(
    (n) => n.id === listing.neighborhoodId
  )?.name;

  return (
    <li className="border border-line bg-white rounded px-4 py-3 flex gap-3">
      {listing.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.imageUrl}
          alt=""
          className="w-20 h-20 object-cover rounded flex-shrink-0"
        />
      )}
      <div className="flex-1">
        <div className="flex justify-between gap-2">
          <span className="font-medium">{listing.address}</span>
          <span className="text-sm text-ink/60">
            {STATUS_LABEL[listing.status] ?? listing.status}
          </span>
        </div>
        {listing.price && <p className="text-ink/70">{listing.price}</p>}
        {neighborhoodName && <p className="text-ink/50 text-sm">{neighborhoodName}</p>}
        {listing.notes && <p className="text-ink/70 text-sm">{listing.notes}</p>}
        {listing.url && (
          <a href={listing.url} className="text-route text-sm block">
            Original listing
          </a>
        )}
        <div className="flex gap-2 text-sm mt-1">
          <button type="button" onClick={() => setEditing(true)} className="text-route">
            Edit
          </button>
          <form
            action={async () => {
              if (confirm(`Delete this listing at ${listing.address}?`)) {
                await deleteListing(listing.id);
              }
            }}
          >
            <button type="submit" className="text-pending">
              Delete
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}
