"use client";

import { useState } from "react";

type Childcare = {
  id: number;
  name: string;
  notes: string | null;
  link: string | null;
  neighborhoodId: number | null;
};
type Neighborhood = { id: number; name: string };

export function EditableChildcare({
  childcare,
  allNeighborhoods,
  updateChildcare,
  deleteChildcare,
}: {
  childcare: Childcare;
  allNeighborhoods: Neighborhood[];
  updateChildcare: (id: number, formData: FormData) => Promise<void>;
  deleteChildcare: (id: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="border border-route bg-white rounded px-4 py-3">
        <form
          action={async (formData) => {
            await updateChildcare(childcare.id, formData);
            setEditing(false);
          }}
          className="flex flex-col gap-2"
        >
          <input
            name="name"
            defaultValue={childcare.name}
            required
            className="border border-line px-2 py-1 rounded"
          />
          <select
            name="neighborhoodId"
            defaultValue={childcare.neighborhoodId ?? ""}
            className="border border-line px-2 py-1 rounded"
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
            defaultValue={childcare.link ?? ""}
            placeholder="Website"
            className="border border-line px-2 py-1 rounded"
          />
          <textarea
            name="notes"
            defaultValue={childcare.notes ?? ""}
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
    (n) => n.id === childcare.neighborhoodId
  )?.name;

  return (
    <li className="border border-line bg-white rounded px-4 py-3 flex items-start justify-between gap-3">
      <div className="flex-1">
        <span className="font-medium">{childcare.name}</span>
        {neighborhoodName && <span className="text-ink/60"> — {neighborhoodName}</span>}
        {childcare.link && (
          <a href={childcare.link} className="text-route text-sm block">
            Website
          </a>
        )}
        {childcare.notes && <p className="text-ink/70 text-sm">{childcare.notes}</p>}
      </div>
      <div className="flex gap-2 text-sm flex-shrink-0">
        <button type="button" onClick={() => setEditing(true)} className="text-route">
          Edit
        </button>
        <form
          action={async () => {
            if (confirm(`Delete ${childcare.name}?`)) {
              await deleteChildcare(childcare.id);
            }
          }}
        >
          <button type="submit" className="text-pending">
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}
