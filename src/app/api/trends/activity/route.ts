import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Log from "@/lib/db/models/log";
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

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { range, year, startMonth, endMonth } = parseRangeParams(
    new URL(request.url).searchParams
  );

  const { startDate, endDate } = getDateRange(range, year, startMonth, endMonth);

  await connectDB();

  const logs = await Log.find({
    userId: session.user.id,
    type: "sport",
    date: {
      $gte: getTaipeiDate(startDate),
      $lte: getTaipeiDate(endDate),
    },
  });

  const buckets: Record<string, number> = {
    "有氧": 0,
    "重訓": 0,
    "伸展": 0,
  };

  logs.forEach((log) => {
    const data = log.data as { sportType?: string } | undefined;
    const sportType = data?.sportType;

    if (typeof sportType !== "string") {
      return;
    }

    if (sportType.includes("跑步") || sportType.includes("有氧")) {
      buckets["有氧"] += 1;
    } else if (sportType.includes("重訓")) {
      buckets["重訓"] += 1;
    } else {
      buckets["伸展"] += 1;
    }
  });

  const data = [
    { name: "有氧", value: buckets["有氧"], fill: "#8B5CF6" },
    { name: "重訓", value: buckets["重訓"], fill: "#EC4899" },
    { name: "伸展", value: buckets["伸展"], fill: "#F59E0B" },
  ];

  return NextResponse.json({ data });
}
