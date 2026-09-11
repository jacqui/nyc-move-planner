import { NextRequest, NextResponse } from "next/server";
import { scrapeListing } from "@/lib/scrapeListing";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const result = await scrapeListing(url);
  return NextResponse.json(result);
}
