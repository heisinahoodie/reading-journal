import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/db/seed";

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
