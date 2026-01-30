export type UserRole = "Admin" | "Member" | "Coach";

export type User = {
  id: string;
  name: string;
  avatar: string;
  status: "Active" | "Suspended";
  role: UserRole;
};

export const STATUS_OPTIONS: Array<User["status"]> = ["Active", "Suspended"];
export const ROLE_OPTIONS: UserRole[] = ["Admin", "Member", "Coach"];

export const CURRENT_USER = {
  name: "Alex",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  greeting: "Good Morning, Alex!",
};

export const DASHBOARD_STATS = {
  water: {
    current: 5,
    message: "再喝幾杯就能達成目標！",
  },
  tasks: [
    {
      id: 1,
      title: "晨間伸展 10 分鐘",
      exp: 50,
      completed: false,
      type: "active",
    },
    {
      id: 2,
      title: "晚餐不吃澱粉",
      exp: 100,
      completed: true,
      type: "done",
    },
  ],
  taskTemplate: {
    title: "",
    exp: 50,
  },
};

export type WaterEntry = {
  id: string;
  amountCc: number;
  time: string;
  note?: string;
};

export const WATER_SETTINGS = {
  cupSizeCc: 300,
  dailyTargetCc: 1800,
  defaultDrinkCc: 250,
  note: "玻璃杯",
};

export const WATER_ENTRIES: WaterEntry[] = [
  { id: "w1", amountCc: 250, time: "08:10", note: "早餐後" },
  { id: "w2", amountCc: 300, time: "10:30" },
  { id: "w3", amountCc: 200, time: "14:20", note: "運動後" },
];

export const TREND_RANGE_OPTIONS = [
  { label: "全年", value: "year" },
  { label: "本月", value: "month" },
  { label: "最近7天", value: "7d" },
  { label: "最近30天", value: "30d" },
  { label: "自訂", value: "custom" },
];

export const TREND_YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => 2021 + i);
export const TREND_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export const LOG_ITEMS = [
  {
    id: "food",
    title: "飲食 (Food)",
    subtitle: "拍張照就算紀錄",
    icon: "Utensils",
    color: "text-foreground", // Default
  },
  {
    id: "sport",
    title: "運動 (Sport)",
    subtitle: "有氧 / 重訓",
    icon: "Dumbbell",
    color: "text-primary",
  },
  {
    id: "weight",
    title: "體重 (Weight)",
    subtitle: "滑動調整",
    icon: "Scale",
    color: "text-accent",
  },
  {
    id: "mood",
    title: "心情 (Mood)",
    subtitle: "今天過得如何？",
    icon: "Smile",
    color: "text-success",
  },
];

export const FOOD_TYPES = ["早餐", "午餐", "晚餐", "點心"];
export const SPORT_TYPES = ["跑步", "重訓", "瑜珈", "游泳"];

export const MOCK_USERS: User[] = [
  {
    id: "#001",
    name: "Alex Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    status: "Active",
    role: "Admin",
  },
  {
    id: "#002",
    name: "Sam Lin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
    status: "Suspended",
    role: "Member",
  },
];

export type HistoryLog = {
  id: string;
  time: string;
  type: "food" | "sport" | "weight" | "mood";
  title: string;
  detail: string;
  value?: string; 
};

// Use a fixed date for demo purposes, or generate dynamic keys in real app
const TODAY = new Date().toISOString().split('T')[0];
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const HISTORY_DATA: Record<string, HistoryLog[]> = {
  [TODAY]: [
    { id: "1", time: "08:30", type: "food", title: "早餐", detail: "燕麥片 + 藍莓", value: "350 kcal" },
    { id: "2", time: "12:30", type: "food", title: "午餐", detail: "雞胸肉沙拉", value: "450 kcal" },
    { id: "3", time: "18:00", type: "sport", title: "慢跑", detail: "河濱公園", value: "45 min" },
    { id: "4", time: "22:00", type: "mood", title: "心情", detail: "今天工作很順利！", value: "😄" },
  ],
  [YESTERDAY]: [
    { id: "5", time: "09:00", type: "weight", title: "體重測量", detail: "比上週輕了！", value: "64.8 kg" },
    { id: "6", time: "19:00", type: "sport", title: "重訓", detail: "背部訓練", value: "60 min" },
  ]
};
