"use client";

import { useState } from "react";

type Neighborhood = {
  id: number;
  name: string;
  borough: string | null;
  notes: string | null;
};

export function EditableNeighborhood({
  neighborhood,
  schoolCount,
  childcareCount,
  updateNeighborhood,
  deleteNeighborhood,
}: {
  neighborhood: Neighborhood;
  schoolCount: number;
  childcareCount: number;
  updateNeighborhood: (id: number, formData: FormData) => Promise<void>;
  deleteNeighborhood: (id: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="border border-route bg-white rounded px-4 py-3">
        <form
          action={async (formData) => {
            await updateNeighborhood(neighborhood.id, formData);
            setEditing(false);
          }}
          className="flex flex-col gap-2"
        >
          <input
            name="name"
            defaultValue={neighborhood.name}
            required
            className="border border-line px-2 py-1 rounded"
          />
          <input
            name="borough"
            defaultValue={neighborhood.borough ?? ""}
            placeholder="Borough / area"
            className="border border-line px-2 py-1 rounded"
          />
          <textarea
            name="notes"
            defaultValue={neighborhood.notes ?? ""}
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

  return (
    <li className="border border-line bg-white rounded px-4 py-3 flex items-start justify-between gap-3">
      <a href={`/neighborhoods/${neighborhood.id}`} className="flex-1">
        <span className="font-medium">{neighborhood.name}</span>
        {neighborhood.borough && (
          <span className="text-ink/60"> — {neighborhood.borough}</span>
        )}
        <span className="text-ink/50 text-sm block">
          {schoolCount} school{schoolCount === 1 ? "" : "s"} ·{" "}
          {childcareCount} childcare option{childcareCount === 1 ? "" : "s"}
        </span>
      </a>
      <div className="flex gap-2 text-sm flex-shrink-0">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-route"
        >
          Edit
        </button>
        <form
          action={async () => {
            if (confirm(`Delete ${neighborhood.name}?`)) {
              await deleteNeighborhood(neighborhood.id);
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
