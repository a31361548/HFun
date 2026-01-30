import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import WaterEntry from "@/lib/db/models/water-entry";
import { auth } from "@/lib/auth";

function getTaipeiDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseRangeParams(searchParams: URLSearchParams) {
  const range = searchParams.get("range");
  const year = searchParams.get("year");
  const startMonth = searchParams.get("startMonth");
  const endMonth = searchParams.get("endMonth");

  return {
    range,
    year: year ? Number(year) : null,
    startMonth: startMonth ? Number(startMonth) : null,
    endMonth: endMonth ? Number(endMonth) : null,
  };
}

function getDateRange(
  range: string | null,
  year: number | null,
  startMonth: number | null,
  endMonth: number | null
) {
  const today = new Date();
  const tzToday = getTaipeiDate(today);
  const [todayYear, todayMonth, todayDay] = tzToday.split("-").map(Number);

  if (range === "7d" || range === "30d") {
    const days = range === "7d" ? 7 : 30;
    const end = new Date(Date.UTC(todayYear, todayMonth - 1, todayDay));
    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - (days - 1));

    return { startDate: start, endDate: end, labelFormat: "MM/DD" };
  }

  if (range === "month") {
    const start = new Date(Date.UTC(todayYear, todayMonth - 1, 1));
    const end = new Date(Date.UTC(todayYear, todayMonth, 0));
    return { startDate: start, endDate: end, labelFormat: "MM/DD" };
  }

  if (range === "year") {
    const start = new Date(Date.UTC(todayYear, 0, 1));
    const end = new Date(Date.UTC(todayYear, 11, 31));
    return { startDate: start, endDate: end, labelFormat: "YYYY/MM" };
  }

  if (year && startMonth && endMonth) {
    const start = new Date(Date.UTC(year, startMonth - 1, 1));
    const end = new Date(Date.UTC(year, endMonth, 0));
    return { startDate: start, endDate: end, labelFormat: "YYYY/MM" };
  }

  const fallbackEnd = new Date(Date.UTC(todayYear, todayMonth - 1, todayDay));
  const fallbackStart = new Date(fallbackEnd);
  fallbackStart.setUTCDate(fallbackEnd.getUTCDate() - 6);
  return { startDate: fallbackStart, endDate: fallbackEnd, labelFormat: "MM/DD" };
}

function formatLabel(date: Date, format: "MM/DD" | "YYYY/MM") {
  if (format === "YYYY/MM") {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { range, year, startMonth, endMonth } = parseRangeParams(
    new URL(request.url).searchParams
  );

  const { startDate, endDate, labelFormat } = getDateRange(
    range,
    year,
    startMonth,
    endMonth
  );

  const normalizedLabelFormat = labelFormat as "MM/DD" | "YYYY/MM";

  await connectDB();

  const entries = await WaterEntry.find({
    userId: session.user.id,
    date: {
      $gte: getTaipeiDate(startDate),
      $lte: getTaipeiDate(endDate),
    },
  }).sort({ date: 1 });

  const grouped: Record<string, number> = {};

  entries.forEach((entry) => {
    const label = formatLabel(
      new Date(`${entry.date}T00:00:00Z`),
      normalizedLabelFormat
    );
    grouped[label] = (grouped[label] ?? 0) + entry.amountCc;
  });

  const data = Object.entries(grouped).map(([date, amount]) => ({
    date,
    amount,
  }));

  return NextResponse.json({ data });
}
