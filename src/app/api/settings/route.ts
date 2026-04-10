import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const db = getDb();
    const existing = db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .all();

    if (existing.length > 0) {
      db.update(settings)
        .set({ value })
        .where(eq(settings.key, key))
        .run();
    } else {
      db.insert(settings)
        .values({ key, value })
        .run();
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save setting" }, { status: 500 });
  }
}
