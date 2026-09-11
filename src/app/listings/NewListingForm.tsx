"use client";

import { useState, useTransition } from "react";

type Neighborhood = { id: number; name: string };

export function NewListingForm({
  neighborhoods,
  createListing,
}: {
  neighborhoods: Neighborhood[];
  createListing: (formData: FormData) => Promise<void>;
}) {
  const [url, setUrl] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [fetchState, setFetchState] = useState<
    "idle" | "loading" | "done" | "empty" | "error"
  >("idle");
  const [isPending, startTransition] = useTransition();

  async function handleFetch() {
    if (!url) return;
    setFetchState("loading");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();

      if (!data.address && !data.price && !data.imageUrl && !data.title) {
        setFetchState("empty");
        return;
      }

      if (data.address) setAddress(data.address);
      if (data.price) setPrice(data.price);
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (data.title) setNotes(data.title);
      setFetchState("done");
    } catch {
      setFetchState("error");
    }
  }

  return (
    <form
      action={(formData) => startTransition(() => createListing(formData))}
      className="flex flex-col gap-3 max-w-sm"
    >
      <label className="flex flex-col gap-1 text-sm text-ink/70">
        Listing URL
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 border border-line bg-white px-3 py-2 rounded text-ink"
          />
          <button
            type="button"
            onClick={handleFetch}
            disabled={!url || fetchState === "loading"}
            className="border border-line px-3 py-2 rounded text-sm whitespace-nowrap disabled:opacity-50"
          >
            {fetchState === "loading" ? "Fetching…" : "Fetch details"}
          </button>
        </div>
      </label>
      <input type="hidden" name="url" value={url} />

      {fetchState === "empty" && (
        <p className="text-sm text-pending">
          Couldn't pull anything from that page — this site may block
          automated fetches. Fill in the fields below by hand.
        </p>
      )}
      {fetchState === "error" && (
        <p className="text-sm text-pending">
          That fetch failed. You can still fill in the fields manually.
        </p>
      )}
      {fetchState === "done" && (
        <p className="text-sm text-done">
          Pulled what we could — please check it over before saving.
        </p>
      )}

      <input
        name="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
        required
        className="border border-line bg-white px-3 py-2 rounded"
      />
      <input
        name="price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price (e.g. $1,250,000 or $4,200/mo)"
        className="border border-line bg-white px-3 py-2 rounded"
      />
      <input
        name="imageUrl"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Image URL (optional)"
        className="border border-line bg-white px-3 py-2 rounded"
      />
      <select
        name="status"
        required
        className="border border-line bg-white px-3 py-2 rounded"
        defaultValue="for_sale"
      >
        <option value="for_sale">For sale</option>
        <option value="for_rent">For rent</option>
        <option value="sold">Sold</option>
      </select>
      <select
        name="neighborhoodId"
        className="border border-line bg-white px-3 py-2 rounded"
        defaultValue=""
      >
        <option value="">No neighborhood selected</option>
        {neighborhoods.map((n) => (
          <option key={n.id} value={n.id}>
            {n.name}
          </option>
        ))}
      </select>
      <textarea
        name="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="border border-line bg-white px-3 py-2 rounded"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-route text-white px-3 py-2 rounded font-medium disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save listing"}
      </button>
    </form>
  );
}
