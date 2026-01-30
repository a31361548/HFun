"use server";

import bcrypt from "bcrypt";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/user";
import { auth } from "@/lib/auth";
import type { IUser, UserRole, UserStatus } from "@/types";

type MemberInput = {
  name: string;
  username: string;
  status: UserStatus;
  role: UserRole;
  password?: string;
};

async function requireAdminUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  if (role !== "Admin") {
    throw new Error("FORBIDDEN");
  }

  return userId;
}

type TimestampValue = string | Date | undefined;

type StringifyTarget = {
  toString: () => string;
};

type MemberWithId = IUser & {
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

const normalizeMember = (member: MemberWithId): IUser => ({
  ...member,
  _id: normalizeId(member._id),
  createdAt: normalizeDate(member.createdAt),
  updatedAt: normalizeDate(member.updatedAt),
});

export async function getMembers(): Promise<IUser[]> {
  await requireAdminUserId();
  await connectDB();

  const members = await User.find().sort({ createdAt: -1 }).lean();

  return members.map((member) => normalizeMember(member as IUser));
}

export async function createMember(input: MemberInput): Promise<IUser> {
  await requireAdminUserId();
  await connectDB();

  const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : "";

  const created = await User.create({
    username: input.username,
    passwordHash,
    name: input.name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${input.name}`,
    role: input.role,
    status: input.status,
  });

  return normalizeMember(created.toObject() as IUser);
}

export async function updateMember(
  memberId: string,
  input: Omit<MemberInput, "username">
): Promise<IUser> {
  await requireAdminUserId();
  await connectDB();

  const nextUpdate: Record<string, unknown> = {
    name: input.name,
    role: input.role,
    status: input.status,
  };

  if (input.password) {
    nextUpdate.passwordHash = await bcrypt.hash(input.password, 10);
  }

  if (input.password && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(input.password)) {
    throw new Error("INVALID_PASSWORD");
  }

  const updated = await User.findByIdAndUpdate(
    memberId,
    {
      $set: nextUpdate,
    },
    { new: true, lean: true }
  );

  if (!updated) {
    throw new Error("NOT_FOUND");
  }

  return normalizeMember(updated as IUser);
}

export async function deleteMember(memberId: string): Promise<void> {
  await requireAdminUserId();
  await connectDB();

  const deleted = await User.findByIdAndDelete(memberId);

  if (!deleted) {
    throw new Error("NOT_FOUND");
  }
}
