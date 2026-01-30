"use client";

import { useEffect, useMemo, useState } from "react";
import { format, addMonths, subMonths, setMonth, setYear, getYear, getMonth } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Utensils, Dumbbell, Scale, Smile, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getDatesWithLogs, getLogsByDate } from "@/actions/logs";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ILog } from "@/types";

const LOG_CONFIG = {
  food: { icon: Utensils, color: "text-orange-600", bg: "bg-orange-100" },
  sport: { icon: Dumbbell, color: "text-blue-600", bg: "bg-blue-100" },
  weight: { icon: Scale, color: "text-yellow-600", bg: "bg-yellow-100" },
  mood: { icon: Smile, color: "text-green-600", bg: "bg-green-100" },
};

type HistoryLogItem = {
  id: string;
  time: string;
  type: "food" | "sport" | "weight" | "mood";
  title: string;
  detail: string;
  value?: string;
};

export default function HistoryPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [logs, setLogs] = useState<HistoryLogItem[]>([]);
  const [datesWithData, setDatesWithData] = useState<Date[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const streakCount = useMemo(() => {
    if (datesWithData.length === 0) return 0;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateSet = new Set(datesWithData.map((item) => item.getTime()));
    let count = 0;

    for (let dayOffset = 0; dayOffset < datesWithData.length + 1; dayOffset += 1) {
      const current = new Date(todayStart);
      current.setDate(todayStart.getDate() - dayOffset);
      const currentKey = current.getTime();
      if (!dateSet.has(currentKey)) break;
      count += 1;
    }

    return count;
  }, [datesWithData]);

  const handleSelectDate = (nextDate: Date | undefined) => {
    setDate((prevDate) => nextDate ?? prevDate);
  };

  const dateKey = date ? format(date, "yyyy-MM-dd") : "";

  const mapLogsToHistory = (items: ILog[]): HistoryLogItem[] =>
    items.map((item) => {
      if (item.type === "food") {
        return {
          id: item._id,
          time: item.time,
          type: item.type,
          title: "飲食",
          detail: item.data.notes ?? item.data.meal,
          value: item.data.meal,
        };
      }

      if (item.type === "sport") {
        return {
          id: item._id,
          time: item.time,
          type: item.type,
          title: "運動",
          detail: item.data.sportType,
          value: `${item.data.duration} min`,
        };
      }

      if (item.type === "weight") {
        return {
          id: item._id,
          time: item.time,
          type: item.type,
          title: "體重測量",
          detail: "體重紀錄",
          value: `${item.data.weight} kg`,
        };
      }

      return {
        id: item._id,
        time: item.time,
        type: item.type,
        title: "心情",
        detail: item.data.notes ?? "心情紀錄",
        value: item.data.emoji,
      };
    });

  const loadLogs = async (nextDate: string) => {
    setIsLoadingLogs(true);
    setLoadError(false);

    try {
      const data = await getLogsByDate(nextDate);
      setLogs(mapLogsToHistory(data));
    } catch (error) {
      setLoadError(true);
      toast.error("歷史紀錄載入失敗，請稍後再試");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const loadDates = async () => {
    try {
      const dates = await getDatesWithLogs();
      setDatesWithData(
        dates.map((item) => {
          const parsed = new Date(item);
          return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        })
      );
    } catch (error) {
      toast.error("日曆資料載入失敗，請稍後再試");
    }
  };

  useEffect(() => {
    if (!dateKey) return;
    void loadLogs(dateKey);
  }, [dateKey]);

  useEffect(() => {
    void loadDates();
  }, []);

  // Navigation Handlers
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleMonthChange = (value: string) => {
    setCurrentMonth(setMonth(currentMonth, parseInt(value)));
  };

  const handleYearChange = (value: string) => {
    setCurrentMonth(setYear(currentMonth, parseInt(value)));
  };

  // Generate Year Options
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="space-y-6 h-full flex flex-col pb-20 md:pb-0">
      <h1 className="text-3xl font-black text-foreground">歷史紀錄 (History)</h1>

      <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0">
        
        {/* Left: Custom Calendar Card */}
        <div className="lg:w-auto shrink-0 flex flex-col gap-6">
          <div className="clay-card bg-white p-6 inline-block shadow-sm border border-black/5 w-full md:w-[380px]">
          {loadError && (
            <div className="clay-card bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl font-bold mb-4">
              目前無法載入歷史紀錄，請稍後再試。
            </div>
          )}

          {/* Custom Header */}
          <div className="flex items-center justify-between mb-6 px-2">

              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary text-text-light"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex gap-4 items-center">
                <Select value={getMonth(currentMonth).toString()} onValueChange={handleMonthChange}>
                  <SelectTrigger className="h-auto w-auto gap-1 border-none shadow-none font-black text-xl text-foreground focus:ring-0 bg-transparent hover:bg-muted/50 p-1 px-2 rounded-lg">
                    <SelectValue>{format(currentMonth, "M月", { locale: zhTW })}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {m + 1}月
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={getYear(currentMonth).toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="h-auto w-auto gap-1 border-none shadow-none font-black text-xl text-foreground focus:ring-0 bg-transparent hover:bg-muted/50 p-1 px-2 rounded-lg">
                    <SelectValue>{getYear(currentMonth)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary text-text-light"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelectDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="border-none w-full"
              locale={zhTW}
              modifiers={{ hasData: datesWithData }}
              modifiersClassNames={{
                hasData: "font-bold underline decoration-primary decoration-2 underline-offset-4"
              }}
              classNames={{
                month_caption: "hidden",
                nav: "hidden"
              }}
            />
          </div>

           {/* Summary Stats */}
           <div className="clay-card bg-primary/10 border-none p-6 text-center shadow-none w-full md:w-[380px]">
             <div className="text-sm text-primary font-bold mb-1 opacity-80">連續紀錄</div>
             <div className="text-4xl font-black text-primary">
               {streakCount || "--"} <span className="text-base font-bold opacity-80">Days</span>
             </div>
           </div>
        </div>

        {/* Right: Timeline Detail */}
        <div className="flex-1 flex flex-col gap-4 bg-background/50 rounded-3xl md:overflow-y-auto custom-scrollbar p-1">
           {/* Timeline Header */}
           <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b border-black/5 mb-2">
             <div className="flex items-center gap-2 text-primary">
                <CalendarIcon size={20} />
                <h2 className="text-xl font-bold text-foreground">
                  {date ? format(date, "M 月 d 日 (EEEE)", { locale: zhTW }) : "請選擇日期"}
                </h2>
             </div>
           </div>

           {isLoadingLogs ? (
             <div className="text-sm font-bold text-text-light bg-muted px-4 py-2 rounded-2xl inline-flex">
               歷史紀錄載入中...
             </div>
           ) : logs.length > 0 ? (
             <div className="space-y-3 pb-4">
               {logs.map((log) => {
                 const Config = LOG_CONFIG[log.type];
                 const Icon = Config.icon;
                 return (
                   <div key={log.id} className="clay-card p-4 flex items-center gap-4 bg-white shadow-sm border border-black/5 hover:shadow-md transition-all">
                      <div className={`w-12 h-12 rounded-xl ${Config.bg} ${Config.color} flex items-center justify-center shrink-0 shadow-sm`}>
                        <Icon size={24} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-lg text-foreground">{log.title}</h3>
                          <span className="text-sm font-bold text-primary font-mono">{log.time}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-base font-medium text-text-main truncate">{log.detail}</p>
                          {log.value && (
                            <span className="text-xs font-black bg-muted px-2 py-1 rounded-md text-foreground">
                              {log.value}
                            </span>
                          )}
                        </div>
                      </div>
                   </div>
                 );
               })}
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-text-light opacity-60 min-h-[200px]">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-3xl shadow-sm grayscale">
                 💤
               </div>
               <p className="font-bold">尚無紀錄</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}


