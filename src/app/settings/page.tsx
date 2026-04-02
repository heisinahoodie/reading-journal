import { getDb } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./settings-client";

async function getSettingsData() {
  const db = getDb();
  const rows = db.select().from(settings).all();
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export default async function SettingsPage() {
  const data = await getSettingsData();

  return (
    <SettingsClient
      currentApiKey={data["anthropic_api_key"] || ""}
      currentModel={data["ai_model"] || "claude-sonnet-4-5-20250514"}
    />
  );
}
