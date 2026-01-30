"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { CheckCircle, Circle, Plus, Sparkles, Settings } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  addWaterEntry,
  createTask,
  getTasksByDate,
  getWaterEntriesByDate,
  getWaterSetting,
  toggleTaskCompletion,
  updateWaterSetting,
} from "@/actions/dashboard";
import type { ITask, IWaterEntry, IWaterSetting } from "@/types";

type WaterSettingForm = {
  cupSizeCc: string;
  dailyTargetCc: string;
  defaultDrinkCc: string;
  note: string;
};

const EMPTY_WATER_FORM: WaterSettingForm = {
  cupSizeCc: "",
  dailyTargetCc: "",
  defaultDrinkCc: "",
  note: "",
};

const formatTaipeiTime = (): string =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

const getGreeting = (name: string): string => {
  const hour = new Date().getHours();
  if (hour < 6) return `晚安，${name}`;
  if (hour < 12) return `早安，${name}`;
  if (hour < 18) return `午安，${name}`;
  return `晚安，${name}`;
};

export default function DashboardPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data ?? null;
  const status = sessionResult?.status ?? "loading";
  const [isWaterSettingOpen, setIsWaterSettingOpen] = useState(false);
  const [waterSetting, setWaterSetting] = useState<IWaterSetting | null>(null);
  const [waterEntries, setWaterEntries] = useState<IWaterEntry[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [waterAmount, setWaterAmount] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskExp, setTaskExp] = useState("50");
  const [waterForm, setWaterForm] = useState<WaterSettingForm>(EMPTY_WATER_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [isAddingWater, setIsAddingWater] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const displayName = session?.user?.name ?? session?.user?.email ?? "朋友";
  const greeting = useMemo(() => getGreeting(displayName), [displayName]);
  const currentCc = useMemo(
    () => waterEntries.reduce((total, entry) => total + entry.amountCc, 0),
    [waterEntries]
  );
  const targetCc = waterSetting?.dailyTargetCc ?? 0;
  const cupSizeCc = waterSetting?.cupSizeCc ?? 0;

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const [setting, entries, taskList] = await Promise.all([
        getWaterSetting(),
        getWaterEntriesByDate(),
        getTasksByDate(),
      ]);
      setWaterSetting(setting);
      setWaterEntries(entries);
      setTasks(taskList);
      setWaterAmount(setting.cupSizeCc.toString());
    } catch (error) {
      setLoadError(true);
      toast.error("資料載入失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!waterSetting) return;
    setWaterForm({
      cupSizeCc: waterSetting.cupSizeCc.toString(),
      dailyTargetCc: waterSetting.dailyTargetCc.toString(),
      defaultDrinkCc: waterSetting.defaultDrinkCc.toString(),
      note: waterSetting.note ?? "",
    });
  }, [waterSetting]);

  const handleAddWater = async (amountOverride?: number) => {
    const amount = Number(amountOverride ?? waterAmount);
    if (!amount || amount <= 0) {
      toast.error("請輸入正確喝水量");
      return;
    }

    setIsAddingWater(true);
    try {
      const created = await addWaterEntry({
        amountCc: amount,
        time: formatTaipeiTime(),
      });
      setWaterEntries((prev) => [...prev, created].sort((a, b) => a.time.localeCompare(b.time)));
      toast.success("喝水紀錄已新增");
    } catch (error) {
      toast.error("新增喝水紀錄失敗，請稍後再試");
    } finally {
      setIsAddingWater(false);
    }
  };

  const handleSaveSetting = async () => {
    const cupSizeCc = Number(waterForm.cupSizeCc);
    const dailyTargetCc = Number(waterForm.dailyTargetCc);
    const defaultDrinkCc = Number(waterForm.defaultDrinkCc);

    if (!cupSizeCc || !dailyTargetCc || !defaultDrinkCc) {
      toast.error("請完整填寫水量設定");
      return;
    }

    setIsSavingSetting(true);
    try {
      const updated = await updateWaterSetting({
        cupSizeCc,
        dailyTargetCc,
        defaultDrinkCc,
        note: waterForm.note,
      });
      setWaterSetting(updated);
      setWaterAmount(updated.cupSizeCc.toString());
      toast.success("水量設定已更新");
      setIsWaterSettingOpen(false);
    } catch (error) {
      toast.error("更新失敗，請稍後再試");
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleCreateTask = async () => {
    const expValue = Number(taskExp);
    if (!taskTitle.trim() || !expValue || expValue <= 0) {
      toast.error("請輸入任務名稱與正確 EXP");
      return;
    }

    setIsCreatingTask(true);
    try {
      const created = await createTask({ title: taskTitle.trim(), exp: expValue });
      setTasks((prev) => [created, ...prev]);
      setTaskTitle("");
      setTaskExp("50");
      toast.success("任務已新增");
    } catch (error) {
      toast.error("新增任務失敗，請稍後再試");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const updated = await toggleTaskCompletion(taskId, completed);
      setTasks((prev) => prev.map((task) => (task._id === updated._id ? updated : task)));
    } catch (error) {
      toast.error("更新任務狀態失敗");
    }
  };

  const renderStatusMessage = (message: string) => (
    <div className="text-sm font-bold text-text-light bg-muted px-4 py-2 rounded-2xl inline-flex">
      {message}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">今日概況</h1>
          <p className="text-text-light font-bold text-lg">
            {status === "loading" ? "正在準備今日資料..." : greeting}
          </p>
        </div>
        <div className="clay-card rounded-full p-1.5 pr-4 flex items-center gap-3 bg-background shadow-clay-out">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src={session?.user?.image ?? ""} alt={displayName} />
            <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-bold text-foreground">{displayName}</span>
        </div>
      </header>

      {loadError && (
        <div className="clay-card bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl font-bold">
          目前無法載入資料，請稍後再試。
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Water Card */}
        <div className="md:col-span-8 relative overflow-hidden rounded-[24px] bg-secondary text-white shadow-clay-out min-h-[260px] p-6 flex flex-col justify-between z-0">
          {/* Content */}
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start h-full gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black opacity-90">Hydration Status</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  className="ml-1 h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => setIsWaterSettingOpen(true)}
                  disabled={isLoading || loadError}
                >
                  <Settings size={18} />
                </Button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black">{isLoading ? "--" : currentCc}</span>
                <span className="text-3xl font-bold opacity-60">/{isLoading ? "--" : targetCc}</span>
                <span className="text-sm font-bold opacity-80">cc</span>
              </div>
              <p className="font-bold opacity-90">
                {isLoading
                  ? "正在計算喝水進度..."
                  : loadError
                    ? "暫時無法取得喝水資料"
                    : currentCc >= targetCc
                      ? "今天超棒，已達成目標！"
                      : "再喝幾杯就能達成目標！"}
              </p>
              <p className="text-sm font-bold text-white/90">
                每日目標 {waterSetting?.dailyTargetCc ?? "--"}{" "}
                <span className="text-white">cc</span> / 單杯 {waterSetting?.cupSizeCc ?? "--"}{" "}
                <span className="text-white">cc</span>
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full lg:w-[280px]">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/90">本次喝水量</label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={cupSizeCc ? `例如 ${cupSizeCc}` : "例如 250"}
                    value={waterAmount}
                    onChange={(event) => setWaterAmount(event.target.value)}
                    className="rounded-2xl bg-white/20 text-white placeholder:text-white/60"
                    disabled={isLoading || loadError || isAddingWater}
                  />
                  <span className="text-sm font-black text-white">cc</span>
                  <Button
                    variant="secondary"
                    className="rounded-full px-4 py-2 text-white bg-white/20 hover:bg-white/30 border-none shadow-none"
                    onClick={() => handleAddWater()}
                    disabled={isLoading || loadError || isAddingWater}
                  >
                    {isAddingWater ? "新增中" : "加入"}
                  </Button>
                </div>
              </div>
              <Button
                size="lg"
                className="rounded-full w-full bg-white/20 hover:bg-white/30 text-white border-none shadow-none backdrop-blur-sm"
                onClick={() => handleAddWater(cupSizeCc)}
                disabled={isLoading || loadError || isAddingWater}
              >
                <Plus size={20} strokeWidth={3} />
                快速加一杯
              </Button>
            </div>
          </div>

          {/* Wave Decoration */}
          <motion.div
            className="absolute bottom-[-40px] left-0 w-full h-[60%] bg-white/20 rounded-[50%_50%_0_0]"
            animate={{ scaleY: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ originY: 1 }}
          />
        </div>

        {/* Water Settings Dialog */}
        <Dialog open={isWaterSettingOpen} onOpenChange={setIsWaterSettingOpen}>
          <DialogContent className="clay-card bg-background border-2 border-white/50 max-w-sm sm:rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-foreground">水量設定</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-foreground">單杯容量</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={waterForm.cupSizeCc}
                    onChange={(event) =>
                      setWaterForm((prev) => ({ ...prev, cupSizeCc: event.target.value }))
                    }
                    className="rounded-2xl"
                    disabled={isSavingSetting}
                  />
                  <span className="text-sm font-bold text-text-light">cc</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-foreground">每日目標</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={waterForm.dailyTargetCc}
                    onChange={(event) =>
                      setWaterForm((prev) => ({ ...prev, dailyTargetCc: event.target.value }))
                    }
                    className="rounded-2xl"
                    disabled={isSavingSetting}
                  />
                  <span className="text-sm font-bold text-text-light">cc</span>
                </div>
              </div>
              <div className="text-sm font-bold text-primary">今日目標：{targetCc || "--"} cc</div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-foreground">備註</label>
                <Textarea
                  value={waterForm.note}
                  onChange={(event) =>
                    setWaterForm((prev) => ({ ...prev, note: event.target.value }))
                  }
                  className="rounded-2xl min-h-[80px]"
                  disabled={isSavingSetting}
                />
              </div>
            </div>
            <DialogFooter className="flex gap-3 mt-6 sm:justify-center">
              <Button variant="secondary" onClick={() => setIsWaterSettingOpen(false)} className="flex-1">
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveSetting}
                className="flex-1"
                disabled={isSavingSetting}
              >
                {isSavingSetting ? "儲存中" : "儲存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Task Card */}
        <div className="md:col-span-4 clay-card bg-background p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">建立每日任務</h3>
              <p className="text-sm text-text-light font-bold">打造你的挑戰清單</p>
            </div>
          </div>
          <div className="space-y-3">
            <Input
              placeholder="任務名稱"
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              className="rounded-2xl"
              disabled={isCreatingTask}
            />
            <Input
              placeholder="獎勵 EXP"
              value={taskExp}
              onChange={(event) => setTaskExp(event.target.value)}
              className="rounded-2xl"
              disabled={isCreatingTask}
            />
          </div>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleCreateTask}
            disabled={isCreatingTask}
          >
            {isCreatingTask ? "建立中..." : "新增任務"}
          </Button>
        </div>

        {/* Daily Quests */}
        <div className="md:col-span-12 clay-card bg-background p-6">
          <h3 className="text-xl font-black text-foreground mb-4">每日任務 (Daily Quests)</h3>
          <div className="flex flex-col gap-3">
            {isLoading && renderStatusMessage("任務載入中...")}
            {loadError && renderStatusMessage("暫時無法載入任務")}
            {!isLoading && !loadError && tasks.length === 0 &&
              renderStatusMessage("今天還沒有任務，先新增一個吧！")}
            {!isLoading && !loadError && tasks.length > 0 &&
              tasks.map((task) => (
                <button
                  key={task._id}
                  type="button"
                  onClick={() => handleToggleTask(task._id, !task.completed)}
                  className={
                    "flex items-center justify-between p-4 rounded-2xl font-bold transition-all cursor-pointer text-left " +
                    (task.completed
                      ? "bg-white shadow-none opacity-60"
                      : "bg-background shadow-clay-in text-foreground")
                  }
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle className="text-success" />
                    ) : (
                      <Circle className="text-text-light" />
                    )}
                    <span className={task.completed ? "line-through text-text-light" : ""}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-xs text-text-light bg-muted px-2 py-1 rounded-lg">
                    +{task.exp} EXP
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
