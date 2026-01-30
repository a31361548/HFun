"use server";

import connectDB from "@/lib/db/connect";
import Log from "@/lib/db/models/log";
import { auth } from "@/lib/auth";
import type { ILog, LogType } from "@/types";

type LogInput = {
  type: LogType;
  date?: string;
  time: string;
  data: Record<string, unknown>;
};

function getTaipeiDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  return userId;
}

type TimestampValue = string | Date | undefined;

type StringifyTarget = {
  toString: () => string;
};

type LogWithId = ILog & {
  _id: unknown;
};

const normalizeId = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (value && typeof value === "object" && "toString" in value) {
    return (value as StringifyTarget).toString();
  }
  return String(value);
};

const normalizeDate = (value: TimestampValue): string => {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : value;
};

const normalizeLog = (log: LogWithId): ILog => ({
  ...log,
  _id: normalizeId(log._id),
  createdAt: normalizeDate(log.createdAt),
});

export async function createLog(input: LogInput): Promise<ILog> {
  const userId = await requireUserId();
  await connectDB();

  const date = input.date ?? getTaipeiDate();

  const created = await Log.create({
    userId,
    type: input.type,
    date,
    time: input.time,
    data: input.data,
  });

  return normalizeLog(created.toObject() as ILog);
}

export async function getLogsByDate(date?: string): Promise<ILog[]> {
  const userId = await requireUserId();
  await connectDB();

  const queryDate = date ?? getTaipeiDate();

  const logs = await Log.find({ userId, date: queryDate })
    .sort({ time: -1 })
    .lean();

  return logs.map((log) => normalizeLog(log as ILog));
}

export async function getDatesWithLogs(): Promise<string[]> {
  const userId = await requireUserId();
  await connectDB();

  const dates = await Log.distinct("date", { userId });

  return dates.sort().reverse();
}
