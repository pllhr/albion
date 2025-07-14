import { NextResponse } from "next/server";
import { getStreakLogs } from "@/actions/streak";

export const dynamic = "force-dynamic"; // disable cache

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || "", 10);
  const month = parseInt(searchParams.get("month") || "", 10) - 1; // client envia 1-12

  if (isNaN(year) || isNaN(month)) {
    return NextResponse.json({ error: "year and month required" }, { status: 400 });
  }

  try {
    const days = await getStreakLogs(year, month);
    return NextResponse.json({ days });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
