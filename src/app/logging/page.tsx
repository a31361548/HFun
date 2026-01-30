"use client";

import { useEffect, useState } from "react";
import { Utensils, Dumbbell, Scale, Smile, Camera, Clock, Flame, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { createLog, getLogsByDate } from "@/actions/logs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FOOD_TYPES, SPORT_TYPES } from "@/lib/mock-data";
import type { ILog, LogType } from "@/types";

const ACTIONS = [
  {
    id: "food",
    title: "飲食 (Food)",
    subtitle: "拍張照就算紀錄",
    icon: Utensils,
    color: "text-foreground",
    hoverColor: "group-hover:text-foreground",
  },
  {
    id: "sport",
    title: "運動 (Sport)",
    subtitle: "有氧 / 重訓",
    icon: Dumbbell,
    color: "text-secondary", 
    hoverColor: "group-hover:text-primary",
  },
  {
    id: "weight",
    title: "體重 (Weight)",
    subtitle: "滑動調整",
    icon: Scale,
    color: "text-accent", 
    hoverColor: "group-hover:text-accent-foreground",
  },
  {
    id: "mood",
    title: "心情 (Mood)",
    subtitle: "今天過得如何？",
    icon: Smile,
    color: "text-success", 
    hoverColor: "group-hover:text-success",
  },
];

const MOODS = ["😄", "🙂", "😐", "😓", "😡"];

export default function LoggingPage() {
  const [selectedLog, setSelectedLog] = useState<LogType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [logs, setLogs] = useState<ILog[]>([]);

  // Form States (UI only)
  const [weight, setWeight] = useState([65]);
  const [duration, setDuration] = useState([30]);
  const [selectedMood, setSelectedMood] = useState("🙂");
  const [foodTypes, setFoodTypes] = useState(FOOD_TYPES);
  const [sportTypes, setSportTypes] = useState(SPORT_TYPES);
  const [foodNote, setFoodNote] = useState("");
  const [newFoodType, setNewFoodType] = useState("");
  const [newSportType, setNewSportType] = useState("");
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [selectedSportTypes, setSelectedSportTypes] = useState<string[]>([]);
  const [isEditingFoodTypes, setIsEditingFoodTypes] = useState(false);
  const [isEditingSportTypes, setIsEditingSportTypes] = useState(false);
  const [foodImageBase64, setFoodImageBase64] = useState<string | null>(null);
  const [foodImageName, setFoodImageName] = useState<string | null>(null);
  const [foodImagePreview, setFoodImagePreview] = useState<string | null>(null);

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    setLoadError(false);

    try {
      const data = await getLogsByDate();
      setLogs(data);
    } catch (error) {
      setLoadError(true);
      toast.error("日誌載入失敗，請稍後再試");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  const handleSubmit = async () => {
    if (!selectedLog) return;

    setLoading(true);
    try {
      const now = new Date();
      const time = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Taipei",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);

      const payload =
        selectedLog === "food"
          ? {
              meal: selectedFoodTypes[0] ?? foodTypes[0] ?? "餐點",
              notes: foodNote.trim() || undefined,
              image: foodImageBase64 ?? undefined,
            }
          : selectedLog === "sport"
            ? {
                sportType: selectedSportTypes[0] ?? sportTypes[0] ?? "運動",
                duration: duration[0],
                calories: duration[0] * 7,
              }
            : selectedLog === "weight"
              ? { weight: weight[0] }
              : { emoji: selectedMood, notes: foodNote.trim() || undefined };

      const created = await createLog({
        type: selectedLog,
        time,
        data: payload,
      });

      setLogs((prev) => [created, ...prev]);
      setSelectedLog(null);
      resetFoodFormState();
      setSelectedSportTypes([]);
      setIsEditingFoodTypes(false);
      setIsEditingSportTypes(false);
      setNewSportType("");
      toast.success("紀錄已儲存！", {
        description: "繼續保持這個節奏！🔥",
      });
    } catch (error) {
      toast.error("儲存失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const renderStatusMessage = (message: string) => (
    <div className="text-sm font-bold text-text-light bg-muted px-4 py-2 rounded-2xl inline-flex">
      {message}
    </div>
  );

  const handleToggleFoodType = (value: string) => {
    setSelectedFoodTypes((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleToggleSportType = (value: string) => {
    setSelectedSportTypes((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleAddFoodType = () => {
    const nextValue = newFoodType.trim();
    if (!nextValue) return;
    setFoodTypes((prev) => (prev.includes(nextValue) ? prev : [...prev, nextValue]));
    setSelectedFoodTypes((prev) => (prev.includes(nextValue) ? prev : [...prev, nextValue]));
    setNewFoodType("");
  };

  const handleAddSportType = () => {
    const nextValue = newSportType.trim();
    if (!nextValue) return;
    setSportTypes((prev) => (prev.includes(nextValue) ? prev : [...prev, nextValue]));
    setSelectedSportTypes((prev) => (prev.includes(nextValue) ? prev : [...prev, nextValue]));
    setNewSportType("");
  };

  const handleRemoveFoodType = (value: string) => {
    setFoodTypes((prev) => prev.filter((item) => item !== value));
    setSelectedFoodTypes((prev) => prev.filter((item) => item !== value));
  };

  const handleRemoveSportType = (value: string) => {
    setSportTypes((prev) => prev.filter((item) => item !== value));
    setSelectedSportTypes((prev) => prev.filter((item) => item !== value));
  };

  const handleFoodImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isValidType = file.type === "image/jpeg" || file.type === "image/png";
    if (!isValidType) {
      toast.error("僅支援 JPG/PNG 圖片");
      event.target.value = "";
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("圖片大小需小於 2MB");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        toast.error("圖片讀取失敗");
        return;
      }
      setFoodImageBase64(result);
      setFoodImagePreview(result);
      setFoodImageName(file.name);
    };
    reader.onerror = () => {
      toast.error("圖片讀取失敗");
    };
    reader.readAsDataURL(file);
  };

  const resetFoodFormState = () => {
    setFoodNote("");
    setSelectedFoodTypes([]);
    setFoodImageBase64(null);
    setFoodImagePreview(null);
    setFoodImageName(null);
  };

  const renderContent = () => {
    switch (selectedLog) {
      case "food":
        return (
          <div className="space-y-6">
            <label className="border-2 border-dashed border-primary/30 rounded-2xl h-48 flex flex-col items-center justify-center text-primary/50 cursor-pointer hover:bg-primary/5 transition-colors">
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={handleFoodImageChange}
              />
              {foodImagePreview ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-muted shadow-clay-in">
                    <img src={foodImagePreview} alt="餐點照片預覽" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-xs font-bold text-text-light truncate max-w-[200px]">
                    {foodImageName}
                  </div>
                </div>
              ) : (
                <>
                  <Camera size={48} className="mb-2" />
                  <span className="font-bold">點擊上傳照片</span>
                  <span className="text-xs font-bold text-text-light">JPG/PNG，最大 2MB</span>
                </>
              )}
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-foreground">常用餐別</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsEditingFoodTypes((prev) => !prev)}
                  >
                    <Pencil size={14} />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {foodTypes.map((meal) => {
                  const isSelected = selectedFoodTypes.includes(meal);
                  return (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => handleToggleFoodType(meal)}
                      className={`relative rounded-xl h-10 px-4 text-base font-bold transition-all border ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-clay-out"
                          : "bg-background text-foreground border-white/60 shadow-clay-in"
                      }`}
                    >
                      {meal}
                      {isEditingFoodTypes && (
                        <span
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs shadow"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRemoveFoodType(meal);
                          }}
                        >
                          <X size={12} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {isEditingFoodTypes && (
                <div className="flex gap-2">
                  <Input
                    value={newFoodType}
                    onChange={(e) => setNewFoodType(e.target.value)}
                    placeholder="新增餐別"
                    className="rounded-2xl"
                  />
                  <Button variant="primary" className="px-4" onClick={handleAddFoodType}>
                    新增
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="font-bold text-foreground">飲食說明</p>
              <Textarea
                value={foodNote}
                onChange={(e) => setFoodNote(e.target.value)}
                placeholder="例如：燕麥片、藍莓、無糖豆漿"
                className="rounded-2xl border-none shadow-clay-in bg-background p-4 min-h-[100px] resize-none"
              />
            </div>
          </div>
        );
      case "sport":
        return (
          <div className="space-y-8 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-foreground">常用運動類型</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsEditingSportTypes((prev) => !prev)}
                  >
                    <Pencil size={14} />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {sportTypes.map((type) => {
                  const isSelected = selectedSportTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleToggleSportType(type)}
                      className={`relative rounded-xl h-10 px-4 text-base font-bold transition-all border ${
                        isSelected
                          ? "bg-secondary text-white border-secondary shadow-clay-out"
                          : "bg-background text-foreground border-white/60 shadow-clay-in"
                      }`}
                    >
                      {type}
                      {isEditingSportTypes && (
                        <span
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs shadow"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRemoveSportType(type);
                          }}
                        >
                          <X size={12} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {isEditingSportTypes && (
                <div className="flex gap-2">
                  <Input
                    value={newSportType}
                    onChange={(e) => setNewSportType(e.target.value)}
                    placeholder="新增運動類型"
                    className="rounded-2xl"
                  />
                  <Button variant="primary" className="px-4" onClick={handleAddSportType}>
                    新增
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex justify-between font-bold">
                <span className="flex items-center gap-2"><Clock size={18} /> 持續時間</span>
                <span className="text-primary">{duration[0]} min</span>
              </div>
              <Slider value={duration} onValueChange={setDuration} max={120} step={5} className="py-4" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between font-bold">
                <span className="flex items-center gap-2"><Flame size={18} /> 消耗熱量</span>
                <span className="text-secondary">~ {duration[0] * 7} kcal</span>
              </div>
            </div>
          </div>
        );
      case "weight":
        return (
          <div className="space-y-12 py-8 text-center">
             <div className="text-6xl font-black text-foreground flex items-center justify-center gap-2">
               {weight[0]} 
               <span className="text-2xl text-text-light mt-4">kg</span>
             </div>
             <Slider value={weight} onValueChange={setWeight} min={40} max={120} step={0.1} className="py-4" />
             <div className="space-y-2">
               <p className="text-sm font-bold text-text-light">自行輸入</p>
               <Input
                 type="number"
                 min={40}
                 max={120}
                 step={0.1}
                 value={weight[0]}
                 onChange={(event) => {
                   const nextValue = Number(event.target.value);
                   if (Number.isNaN(nextValue)) return;
                   setWeight([nextValue]);
                 }}
                 className="rounded-2xl text-center"
               />
             </div>
             <p className="text-text-light font-bold">上次紀錄: 65.2 kg (-0.2)</p>
          </div>
        );
      case "mood":
        return (
          <div className="space-y-6">
             <div className="flex justify-between px-2">
               {MOODS.map(m => (
                 <button 
                   key={m} 
                   onClick={() => setSelectedMood(m)}
                   className={`text-4xl transition-transform hover:scale-125 p-2 rounded-full ${selectedMood === m ? 'bg-secondary/20 scale-125' : ''}`}
                 >
                   {m}
                 </button>
               ))}
             </div>
             <Textarea placeholder="寫下你的心情..." className="rounded-2xl border-none shadow-clay-in bg-background p-4 min-h-[120px] resize-none" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-foreground">紀錄一下 (Log Activity)</h1>
      
      {loadError && (
        <div className="clay-card bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl font-bold">
          目前無法載入日誌資料，請稍後再試。
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isLoadingLogs && renderStatusMessage("日誌載入中...")}
        {!isLoadingLogs && !loadError && logs.length === 0 &&
          renderStatusMessage("今天還沒有任何紀錄")}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ACTIONS.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedLog(item.id as LogType)}
            className="group cursor-pointer flex flex-col items-center text-center p-6 rounded-[24px] hover:bg-white/50 transition-colors duration-300"
          >
            {/* Icon Circle */}
            <div className={`
              w-24 h-24 rounded-full bg-background shadow-clay-out mb-6 
              flex items-center justify-center transition-transform duration-300 
              group-hover:scale-110 group-active:scale-95
              ${item.color} ${item.hoverColor}
            `}>
              <item.icon size={40} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
            <p className="text-sm font-bold text-text-light">{item.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Dynamic Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="clay-card bg-background border-2 border-white/50 max-w-sm sm:max-w-md sm:rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center mb-4">
              {ACTIONS.find(a => a.id === selectedLog)?.title}
            </DialogTitle>
          </DialogHeader>
          
          {renderContent()}

          <Button 
            variant="primary" 
            size="lg" 
            className="w-full mt-6 text-lg" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "儲存中..." : "確認紀錄"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
