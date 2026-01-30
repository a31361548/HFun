// ============================================
// User Types
// ============================================

export type UserRole = "Admin" | "Member" | "Coach";
export type UserStatus = "Active" | "Suspended";

export interface IUser {
  _id: string;
  username: string;
  passwordHash: string;
  name: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Water Types
// ============================================

export interface IWaterSetting {
  _id: string;
  userId: string;
  cupSizeCc: number;
  dailyTargetCc: number;
  defaultDrinkCc: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWaterEntry {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  amountCc: number;
  time: string; // HH:mm
  note?: string;
  createdAt: string;
}

// ============================================
// Task Types
// ============================================

export interface ITask {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  exp: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Log Types
// ============================================

export type LogType = "food" | "sport" | "weight" | "mood";

export interface ILogBase {
  _id: string;
  userId: string;
  type: LogType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: string;
}

export interface IFoodLog extends ILogBase {
  type: "food";
  data: {
    meal: string; // 早餐、午餐、晚餐、點心
    image?: string;
    notes?: string;
  };
}

export interface ISportLog extends ILogBase {
  type: "sport";
  data: {
    sportType: string; // 跑步、重訓、瑜珈、游泳
    duration: number; // minutes
    calories?: number;
  };
}

export interface IWeightLog extends ILogBase {
  type: "weight";
  data: {
    weight: number; // kg
  };
}

export interface IMoodLog extends ILogBase {
  type: "mood";
  data: {
    emoji: string;
    notes?: string;
  };
}

export type ILog = IFoodLog | ISportLog | IWeightLog | IMoodLog;

// ============================================
// Trend Types
// ============================================

export interface IWeightTrendData {
  date: string;
  weight: number;
}

export interface IActivityTrendData {
  name: string;
  value: number;
  fill: string;
}

export interface IHydrationTrendData {
  date: string;
  amount: number;
}
