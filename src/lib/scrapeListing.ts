import * as cheerio from "cheerio";

export type ScrapedListing = {
  address: string | null;
  price: string | null;
  imageUrl: string | null;
  title: string | null;
};

const EMPTY: ScrapedListing = {
  address: null,
  price: null,
  imageUrl: null,
  title: null,
};

export async function scrapeListing(url: string): Promise<ScrapedListing> {
  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        // A plain, honest browser-like UA. This is a best-effort personal
        // convenience fetch, not an attempt to evade bot protection —
        // sites that block it should just fail gracefully below.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return EMPTY;
    html = await res.text();
  } catch {
    return EMPTY;
  }

  const $ = cheerio.load(html);
  const result: ScrapedListing = { ...EMPTY };

  // 1. schema.org JSON-LD — most listing sites embed this for search engines.
  $('script[type="application/ld+json"]').each((_, el) => {
    if (result.address && result.price) return;
    try {
      const parsed = JSON.parse($(el).contents().text());
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of candidates) {
        const addr = item?.address;
        if (!result.address && addr) {
          if (typeof addr === "string") result.address = addr;
          else if (addr.streetAddress) {
            result.address = [
              addr.streetAddress,
              addr.addressLocality,
              addr.addressRegion,
            ]
              .filter(Boolean)
              .join(", ");
          }
        }
        const price = item?.offers?.price ?? item?.price;
        if (!result.price && price) result.price = String(price);
        const image = item?.image;
        if (!result.imageUrl && image) {
          result.imageUrl = Array.isArray(image) ? image[0] : image;
        }
        if (!result.title && item?.name) result.title = item.name;
      }
    } catch {
      // Not valid JSON-LD — skip it.
    }
  });

  // 2. Open Graph tags as a fallback / supplement.
  if (!result.title) {
    result.title = $('meta[property="og:title"]').attr("content") ?? null;
  }
  if (!result.imageUrl) {
    result.imageUrl = $('meta[property="og:image"]').attr("content") ?? null;
  }
  if (!result.address) {
    result.address =
      $('meta[property="og:street-address"]').attr("content") ?? null;
  }

  // 3. Last-resort regex for a dollar-sign price in the page description.
  if (!result.price) {
    const description =
      $('meta[property="og:description"]').attr("content") ??
      $('meta[name="description"]').attr("content") ??
      "";
    const match = description.match(/\$[\d,]+/);
    if (match) result.price = match[0];
  }

  return result;
}
