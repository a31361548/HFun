"use server";

import bcrypt from "bcrypt";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/user";
import { auth } from "@/lib/auth";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

type ProfileInput = {
  name: string;
  username: string;
  avatar?: string | null;
};

const requireUserId = async (): Promise<string> => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  return userId;
};

export async function updateProfile(
  input: ProfileInput
): Promise<{ name: string; username: string; avatar: string }> {
  const userId = await requireUserId();
  await connectDB();

  const existing = await User.findOne({
    username: input.username,
    _id: { $ne: userId },
  }).lean();

  if (existing) {
    throw new Error("USERNAME_TAKEN");
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        name: input.name,
        username: input.username,
        avatar: input.avatar ?? "",
      },
    },
    { new: true, lean: true }
  );

  if (!updated) {
    throw new Error("NOT_FOUND");
  }

  return { name: updated.name, username: updated.username, avatar: updated.avatar };
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const userId = await requireUserId();
  await connectDB();

  const existing = await User.findOne({
    username,
    _id: { $ne: userId },
  }).lean();

  return !existing;
}

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  const userId = await requireUserId();
  await connectDB();

  if (!PASSWORD_REGEX.test(input.newPassword)) {
    throw new Error("INVALID_PASSWORD");
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error("NOT_FOUND");
  }

  const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);
  await User.findByIdAndUpdate(userId, { $set: { passwordHash } });
}
