"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TREND_MONTH_OPTIONS, TREND_RANGE_OPTIONS, TREND_YEAR_OPTIONS } from "@/lib/mock-data";
import type { IActivityTrendData, IHydrationTrendData, IWeightTrendData } from "@/types";

type TrendRange = "year" | "month" | "7d" | "30d" | "custom";

type WeightPoint = { label: string; weight: number };
type WaterPoint = { label: string; amountCc: number };

type TooltipPayloadItem = {
  value: number;
  name?: string;
};

type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 backdrop-blur-sm border-2 border-white rounded-xl p-3 shadow-clay-out">
        <p className="font-bold text-foreground">{label}</p>
        <p className="text-primary font-bold">
          {payload[0].value} {payload[0].name === "amountCc" ? "cc" : payload[0].name === "weight" ? "kg" : "%"}
        </p>
      </div>
    );
  }
  return null;
};

const buildTrendQuery = (
  range: TrendRange,
  year: string,
  startMonth: string,
  endMonth: string
): string => {
  if (range !== "custom") {
    return `range=${range}`;
  }

  const start = Math.min(Number(startMonth), Number(endMonth));
  const end = Math.max(Number(startMonth), Number(endMonth));
  return `year=${year}&startMonth=${start}&endMonth=${end}`;
};

const mapWeightData = (data: IWeightTrendData[]): WeightPoint[] =>
  data.map((item) => ({ label: item.date, weight: item.weight }));

const mapHydrationData = (data: IHydrationTrendData[]): WaterPoint[] =>
  data.map((item) => ({ label: item.date, amountCc: item.amount }));

export default function TrendsPage() {
  const [weightRange, setWeightRange] = useState<TrendRange>("month");
  const [activityRange, setActivityRange] = useState<TrendRange>("month");
  const [hydrationRange, setHydrationRange] = useState<TrendRange>("month");
  const [weightYear, setWeightYear] = useState("2026");
  const [weightStartMonth, setWeightStartMonth] = useState("1");
  const [weightEndMonth, setWeightEndMonth] = useState("12");
  const [activityYear, setActivityYear] = useState("2026");
  const [activityStartMonth, setActivityStartMonth] = useState("1");
  const [activityEndMonth, setActivityEndMonth] = useState("12");
  const [hydrationYear, setHydrationYear] = useState("2026");
  const [hydrationStartMonth, setHydrationStartMonth] = useState("1");
  const [hydrationEndMonth, setHydrationEndMonth] = useState("12");
  const [weightData, setWeightData] = useState<WeightPoint[]>([]);
  const [activityData, setActivityData] = useState<IActivityTrendData[]>([]);
  const [hydrationData, setHydrationData] = useState<WaterPoint[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrend = async <T,>(endpoint: string, query: string): Promise<T> => {
    const res = await fetch(`/api/trends/${endpoint}?${query}`);
    if (!res.ok) {
      throw new Error("FETCH_FAILED");
    }
    return (await res.json()) as T;
  };

  const loadTrends = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const weightQuery = buildTrendQuery(weightRange, weightYear, weightStartMonth, weightEndMonth);
      const activityQuery = buildTrendQuery(activityRange, activityYear, activityStartMonth, activityEndMonth);
      const hydrationQuery = buildTrendQuery(hydrationRange, hydrationYear, hydrationStartMonth, hydrationEndMonth);

      const [weightRes, activityRes, hydrationRes] = await Promise.all([
        fetchTrend<{ data: IWeightTrendData[] }>("weight", weightQuery),
        fetchTrend<{ data: IActivityTrendData[] }>("activity", activityQuery),
        fetchTrend<{ data: IHydrationTrendData[] }>("hydration", hydrationQuery),
      ]);

      setWeightData(mapWeightData(weightRes.data));
      setActivityData(activityRes.data);
      setHydrationData(mapHydrationData(hydrationRes.data));
    } catch (error) {
      setLoadError(true);
      toast.error("趨勢資料載入失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTrends();
  }, [weightRange, weightYear, weightStartMonth, weightEndMonth, activityRange, activityYear, activityStartMonth, activityEndMonth, hydrationRange, hydrationYear, hydrationStartMonth, hydrationEndMonth]);

  return (
    <div className="space-y-8 pb-20">
      <h1 className="text-3xl font-black text-foreground">健康趨勢 (Trends)</h1>

      {loadError && (
        <div className="clay-card bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl font-bold">
          目前無法載入趨勢資料，請稍後再試。
        </div>
      )}

      {isLoading && !loadError && (
        <div className="text-sm font-bold text-text-light bg-muted px-4 py-2 rounded-2xl inline-flex">
          趨勢資料載入中...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Weight Chart (Full Width) */}
        <div className="md:col-span-2">
           <Card className="clay-card border-none shadow-clay-out bg-background h-[400px] flex flex-col">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="w-3 h-8 bg-accent rounded-full block"></span>
                體重變化 (Weight)
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select value={weightRange} onValueChange={(value) => setWeightRange(value as TrendRange)}>
                  <SelectTrigger className="h-9 w-[140px] rounded-xl">
                    <SelectValue placeholder="選擇區間" />
                  </SelectTrigger>
                  <SelectContent>
                    {TREND_RANGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {weightRange === "custom" && (
                  <div className="flex flex-wrap gap-2">
                    <Select value={weightYear} onValueChange={setWeightYear}>
                      <SelectTrigger className="h-9 w-[110px] rounded-xl">
                        <SelectValue placeholder="年份" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREND_YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}年
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={weightStartMonth} onValueChange={setWeightStartMonth}>
                      <SelectTrigger className="h-9 w-[110px] rounded-xl">
                        <SelectValue placeholder="起始月" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREND_MONTH_OPTIONS.map((month) => (
                          <SelectItem key={month} value={String(month)}>
                            {month}月
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={weightEndMonth} onValueChange={setWeightEndMonth}>
                      <SelectTrigger className="h-9 w-[110px] rounded-xl">
                        <SelectValue placeholder="結束月" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREND_MONTH_OPTIONS.map((month) => (
                          <SelectItem key={month} value={String(month)}>
                            {month}月
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F6E980" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F6E980" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#A0AEC0', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#A0AEC0', fontSize: 12}} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="weight" stroke="#F6E980" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity Pie Chart */}
        <Card className="clay-card border-none shadow-clay-out bg-background h-[350px] flex flex-col">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="w-3 h-8 bg-secondary rounded-full block"></span>
                運動比例 (Activity)
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select value={activityRange} onValueChange={(value) => setActivityRange(value as TrendRange)}>
                  <SelectTrigger className="h-9 w-[140px] rounded-xl">
                    <SelectValue placeholder="選擇區間" />
                  </SelectTrigger>
                  <SelectContent>
                    {TREND_RANGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activityRange === "custom" && (
                  <div className="flex flex-wrap gap-2">
                    <Select value={activityYear} onValueChange={setActivityYear}>
                      <SelectTrigger className="h-9 w-[110px] rounded-xl">
                        <SelectValue placeholder="年份" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREND_YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}年
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={activityStartMonth} onValueChange={setActivityStartMonth}>
                      <SelectTrigger className="h-9 w-[110px] rounded-xl">
                        <SelectValue placeholder="起始月" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREND_MONTH_OPTIONS.map((month) => (
                          <SelectItem key={month} value={String(month)}>
                            {month}月
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={activityEndMonth} onValueChange={setActivityEndMonth}>
                      <SelectTrigger className="h-9 w-[110px] rounded-xl">
                        <SelectValue placeholder="結束月" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREND_MONTH_OPTIONS.map((month) => (
                          <SelectItem key={month} value={String(month)}>
                            {month}月
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                      data={activityData}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >

                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} className="shadow-lg" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontWeight: 'bold', color: '#4A5568' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* Hydration Bar Chart */}
        <Card className="clay-card border-none shadow-clay-out bg-background h-[350px] flex flex-col">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="w-3 h-8 bg-primary rounded-full block"></span>
                飲水量 (Hydration)
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select value={hydrationRange} onValueChange={(value) => setHydrationRange(value as TrendRange)}>
                  <SelectTrigger className="h-9 w-[140px] rounded-xl">
                    <SelectValue placeholder="選擇區間" />
                  </SelectTrigger>
                  <SelectContent>
                    {TREND_RANGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hydrationRange === "custom" && (
                  <div className="flex flex-wrap gap-2">
                    <Select value={hydrationYear} onValueChange={setHydrationYear}>
                      <SelectTrigger className="h-9 w-[110px] rounded-xl">
                        <SelectValue placeholder="年份" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREND_YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}年
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={hydrationStartMonth} onValueChange={setHydrationStartMonth}>
                      <SelectTrigger className="h-9 w-[110px] rounded-xl">
                        <SelectValue placeholder="起始月" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREND_MONTH_OPTIONS.map((month) => (
                          <SelectItem key={month} value={String(month)}>
                            {month}月
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={hydrationEndMonth} onValueChange={setHydrationEndMonth}>
                      <SelectTrigger className="h-9 w-[110px] rounded-xl">
                        <SelectValue placeholder="結束月" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREND_MONTH_OPTIONS.map((month) => (
                          <SelectItem key={month} value={String(month)}>
                            {month}月
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hydrationData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#A0AEC0', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amountCc" fill="#84CEEB" radius={[10, 10, 10, 10]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
