"use client";

import { useState } from "react";

type School = {
  id: number;
  name: string;
  notes: string | null;
  realEstateLink: string | null;
};
type Neighborhood = { id: number; name: string };

export function EditableSchool({
  school,
  allNeighborhoods,
  linkedNeighborhoodIds,
  updateSchool,
  deleteSchool,
}: {
  school: School;
  allNeighborhoods: Neighborhood[];
  linkedNeighborhoodIds: number[];
  updateSchool: (id: number, formData: FormData) => Promise<void>;
  deleteSchool: (id: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="border border-route bg-white rounded px-4 py-3">
        <form
          action={async (formData) => {
            await updateSchool(school.id, formData);
            setEditing(false);
          }}
          className="flex flex-col gap-2"
        >
          <input
            name="name"
            defaultValue={school.name}
            required
            className="border border-line px-2 py-1 rounded"
          />
          <input
            name="realEstateLink"
            defaultValue={school.realEstateLink ?? ""}
            placeholder="Real estate search link"
            className="border border-line px-2 py-1 rounded"
          />
          <textarea
            name="notes"
            defaultValue={school.notes ?? ""}
            placeholder="Notes"
            className="border border-line px-2 py-1 rounded"
          />
          <fieldset className="flex flex-col gap-1">
            <legend className="text-sm text-ink/70">Zoned neighborhoods</legend>
            {allNeighborhoods.map((n) => (
              <label key={n.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="neighborhoodIds"
                  value={n.id}
                  defaultChecked={linkedNeighborhoodIds.includes(n.id)}
                />
                {n.name}
              </label>
            ))}
          </fieldset>
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

  const linkedNames = allNeighborhoods
    .filter((n) => linkedNeighborhoodIds.includes(n.id))
    .map((n) => n.name);

  return (
    <li className="border border-line bg-white rounded px-4 py-3 flex items-start justify-between gap-3">
      <div className="flex-1">
        <span className="font-medium">{school.name}</span>
        {linkedNames.length > 0 && (
          <span className="text-ink/60"> — {linkedNames.join(", ")}</span>
        )}
        {school.realEstateLink && (
          <a href={school.realEstateLink} className="text-route text-sm block">
            Real estate search
          </a>
        )}
        {school.notes && <p className="text-ink/70 text-sm">{school.notes}</p>}
      </div>
      <div className="flex gap-2 text-sm flex-shrink-0">
        <button type="button" onClick={() => setEditing(true)} className="text-route">
          Edit
        </button>
        <form
          action={async () => {
            if (confirm(`Delete ${school.name}?`)) {
              await deleteSchool(school.id);
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
