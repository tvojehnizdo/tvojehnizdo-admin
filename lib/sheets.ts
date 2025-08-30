export type LogEmailRow = {
  to: string;
  subject: string;
  status: "queued" | "sent" | "error";
  ts?: string;
  meta?: Record<string, unknown>;
};

export async function logEmailRow(row: LogEmailRow): Promise<boolean> {
  // STUB: sem napojíme Google Sheets/Notion později
  console.log("[sheets:stub] logEmailRow ->", row.subject, row.status);
  return true;
}
