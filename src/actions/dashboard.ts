"use server";

import connectDB from "@/lib/db/connect";
import WaterSetting from "@/lib/db/models/water-setting";
import WaterEntry from "@/lib/db/models/water-entry";
import Task from "@/lib/db/models/task";
import { auth } from "@/lib/auth";
import type { ITask, IWaterEntry, IWaterSetting } from "@/types";

type WaterSettingInput = {
  cupSizeCc: number;
  dailyTargetCc: number;
  defaultDrinkCc: number;
  note?: string;
};

type WaterEntryInput = {
  amountCc: number;
  time: string;
  note?: string;
  date?: string;
};

type TaskInput = {
  title: string;
  exp: number;
  date?: string;
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

type WaterSettingWithId = IWaterSetting & {
  _id: unknown;
};

type WaterEntryWithId = IWaterEntry & {
  _id: unknown;
};

type TaskWithId = ITask & {
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

const normalizeWaterSetting = (setting: WaterSettingWithId): IWaterSetting => ({
  ...setting,
  _id: normalizeId(setting._id),
  createdAt: normalizeDate(setting.createdAt),
  updatedAt: normalizeDate(setting.updatedAt),
});

const normalizeWaterEntry = (entry: WaterEntryWithId): IWaterEntry => ({
  ...entry,
  _id: normalizeId(entry._id),
  createdAt: normalizeDate(entry.createdAt),
});

const normalizeTask = (task: TaskWithId): ITask => ({
  ...task,
  _id: normalizeId(task._id),
  createdAt: normalizeDate(task.createdAt),
  updatedAt: normalizeDate(task.updatedAt),
});

export async function getWaterSetting(): Promise<IWaterSetting> {
  const userId = await requireUserId();
  await connectDB();

  const existing = await WaterSetting.findOne({ userId }).lean();

  if (existing) {
    return normalizeWaterSetting(existing as IWaterSetting);
  }

  const created = await WaterSetting.create({
    userId,
    cupSizeCc: 300,
    dailyTargetCc: 1800,
    defaultDrinkCc: 250,
    note: "",
  });

  return normalizeWaterSetting(created.toObject() as IWaterSetting);
}

export async function updateWaterSetting(
  input: WaterSettingInput
): Promise<IWaterSetting> {
  const userId = await requireUserId();
  await connectDB();

  const updated = await WaterSetting.findOneAndUpdate(
    { userId },
    {
      $set: {
        cupSizeCc: input.cupSizeCc,
        dailyTargetCc: input.dailyTargetCc,
        defaultDrinkCc: input.defaultDrinkCc,
        note: input.note ?? "",
      },
    },
    { new: true, upsert: true, lean: true }
  );

  if (!updated) {
    throw new Error("NOT_FOUND");
  }

  return normalizeWaterSetting(updated as IWaterSetting);
}

export async function addWaterEntry(
  input: WaterEntryInput
): Promise<IWaterEntry> {
  const userId = await requireUserId();
  await connectDB();

  const date = input.date ?? getTaipeiDate();

  const created = await WaterEntry.create({
    userId,
    date,
    amountCc: input.amountCc,
    time: input.time,
    note: input.note ?? "",
  });

  return normalizeWaterEntry(created.toObject() as IWaterEntry);
}

export async function getWaterEntriesByDate(
  date?: string
): Promise<IWaterEntry[]> {
  const userId = await requireUserId();
  await connectDB();

  const queryDate = date ?? getTaipeiDate();

  const entries = await WaterEntry.find({ userId, date: queryDate })
    .sort({
      time: 1,
    })
    .lean();

  return entries.map((entry) => normalizeWaterEntry(entry as IWaterEntry));
}

export async function getTasksByDate(date?: string): Promise<ITask[]> {
  const userId = await requireUserId();
  await connectDB();

  const queryDate = date ?? getTaipeiDate();

  const tasks = await Task.find({ userId, date: queryDate })
    .sort({
      createdAt: 1,
    })
    .lean();

    return tasks.map((task) => normalizeTask(task as ITask));
}

export async function createTask(
input: TaskInput): Promise<ITask> {
  const userId = await requireUserId();
  await connectDB();

  const date = input.date ?? getTaipeiDate();

  const created = await Task.create({
    userId,
    date,
    title: input.title,
    exp: input.exp,
    completed: false,
  });

  return normalizeTask(created.toObject() as ITask);
}

export async function toggleTaskCompletion(
  taskId: string,
  completed: boolean
): Promise<ITask> {
  const userId = await requireUserId();
  await connectDB();

  const updated = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { $set: { completed } },
    { new: true, lean: true }
  );

  if (!updated) {
    throw new Error("NOT_FOUND");
  }

  return normalizeTask(updated as ITask);
}
