import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp, Target, Calendar, Lightbulb, Loader2 } from "lucide-react";
import { MEAL_COLORS } from "../constants";
import { supabase } from "../../lib/supabaseClient";

const API = "https://localhost:7214";

function glToColor(gl: number | null) {
  if (gl === null) return "#FAF7F2";
  if (gl > 100) return "#C4673A";
  if (gl > 80) return "#3D6B4F";
  if (gl > 60) return "#6A9E72";
  return "#EDE8DF";
}

export function Analytics() {
  const [period, setPeriod] = useState("Last 7 days");
  const [isLoading, setIsLoading] = useState(true);
  const [glTarget, setGlTarget] = useState(100);

  // Dynamic Data States
  const [weekData, setWeekData] = useState<{ day: string; gl: number }[]>([]);
  const [mealTypeData, setMealTypeData] = useState<{ meal: string; gl: number; color: string }[]>([]);
  const [heatmapData, setHeatmapData] = useState<{ date: number; gl: number | null }[]>([]);
  
  // Summary States
  const [avgGL, setAvgGL] = useState(0);
  const [daysOnTarget, setDaysOnTarget] = useState(0);
  const [peakDay, setPeakDay] = useState({ name: "-", val: 0 });
  const [bestDay, setBestDay] = useState({ name: "-", val: 0 });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Get Target
        const profileRes = await fetch(`${API}/api/user-profile/${user.id}`);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setGlTarget(profile.dailyGlTarget || 100);
        }

        // 2. Get Weekly Trend
        const weekRes = await fetch(`${API}/api/dashboard/weekly?userId=${user.id}`);
        if (weekRes.ok) {
          const weekRaw = await weekRes.json();
          let total = 0;
          let targetCount = 0;
          let peak = { name: "-", val: -1 };
          let best = { name: "-", val: 9999 };

          const formattedWeek = weekRaw.map((item: any) => {
            const dateObj = new Date(item.date);
            const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
            const gl = item.totalGl;
            
            total += gl;
            if (gl > 0 && gl <= (glTarget || 100)) targetCount++;
            if (gl > peak.val) peak = { name: dayName, val: gl };
            if (gl > 0 && gl < best.val) best = { name: dayName, val: gl };

            return { day: dayName, gl };
          });

          setWeekData(formattedWeek);
          setAvgGL(Math.round(total / (weekRaw.length || 1)));
          setDaysOnTarget(targetCount);
          setPeakDay(peak.val > -1 ? peak : { name: "-", val: 0 });
          setBestDay(best.val < 9999 ? best : { name: "-", val: 0 });
        }

        // 3. Get Heatmap Data (Current Month)
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth() + 1; // 1-12
        const daysInMonth = new Date(y, m, 0).getDate();
        
        const monthRes = await fetch(`${API}/api/dashboard/monthly?userId=${user.id}&year=${y}&month=${m}`);
        if (monthRes.ok) {
          const monthRaw = await monthRes.json();
          const mappedHeatmap = [];
          for (let i = 1; i <= daysInMonth; i++) {
            const match = monthRaw.find((d: any) => {
               const dayNum = parseInt(d.date.split("-")[2], 10);
               return dayNum === i;
            });
            mappedHeatmap.push({ date: i, gl: match ? match.totalGl : null });
          }
          setHeatmapData(mappedHeatmap);
        }

        // 4. Calculate Meal Type Averages (Using a generic pull of recent entries)
        const entriesRes = await fetch(`${API}/api/meal-entries?userId=${user.id}`);
        if (entriesRes.ok) {
            const entries = await entriesRes.json();
            const sums = { Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 };
            const counts = { Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 };

            entries.forEach((e: any) => {
                const type = (e.mealType.charAt(0).toUpperCase() + e.mealType.slice(1)) as keyof typeof sums;
                if (sums[type] !== undefined) {
                    sums[type] += e.finalGL;
                    counts[type]++;
                }
            });

            const mealStats = (["Breakfast", "Lunch", "Dinner", "Snack"] as const).map(meal => ({
                meal,
                gl: counts[meal] > 0 ? Math.round(sums[meal] / counts[meal]) : 0,
                color: MEAL_COLORS[meal]
            }));
            setMealTypeData(mealStats);
        }

      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [glTarget]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1C1C1C" }}>Analytics</h1>
        <select
          value={period} onChange={e => setPeriod(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none font-medium"
          style={{ borderColor: "#EDE8DF", backgroundColor: "white", color: "#1C1C1C" }}
        >
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Avg Daily GL", value: avgGL, unit: "GL", chip: "Recent Avg", chipColor: "#3D6B4F", chipBg: "#E8F5EC", icon: TrendingDown },
          { label: "Days on Target", value: daysOnTarget, unit: "/ 7", chip: "Past Week", chipColor: "#3D6B4F", chipBg: "#E8F5EC", icon: Target },
          { label: "Peak GL Day", value: peakDay.val, unit: "GL", chip: peakDay.name, chipColor: "#C4673A", chipBg: "#FAEAE3", icon: TrendingUp },
          { label: "Best Day", value: bestDay.val, unit: "GL", chip: bestDay.name, chipColor: "#3D6B4F", chipBg: "#E8F5EC", icon: Calendar },
        ].map(({ label, value, unit, chip, chipColor, chipBg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl p-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={14} style={{ color: "#6B6B6B" }} />
              <span className="text-xs" style={{ color: "#6B6B6B" }}>{label}</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold" style={{ color: "#1C1C1C", fontVariantNumeric: "tabular-nums" }}>{value}</span>
              <span className="text-sm" style={{ color: "#6B6B6B" }}>{unit}</span>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: chipBg, color: chipColor }}>
              {chip}
            </span>
          </div>
        ))}
      </div>

      {/* Bar Chart — glossy */}
      <div className="rounded-xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1A3829 0%, #2D5540 55%, #3D6B4F 100%)", boxShadow: "0 6px 28px rgba(61,107,79,0.35)" }}>
        <div className="absolute top-[-50px] right-[-30px] w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(111,212,154,0.18) 0%, transparent 70%)" }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Daily GL — 7 Day</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData} barSize={40}>
              <XAxis key="x" dataKey="day" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} axisLine={false} tickLine={false} />
              <YAxis key="y" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} />
              <ReferenceLine key="ref" y={glTarget} stroke="#F5C46A" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "Target", position: "right", fontSize: 10, fill: "#F5C46A" }} />
              <Bar
                key="bar"
                dataKey="gl"
                shape={(props: any) => {
                  const { x, y, width, height, value } = props;
                  const fill = value > glTarget ? "#F5A07A" : "#6FD49A";
                  return <rect x={x} y={y} width={width} height={Math.max(height, 0)} rx={4} fill={fill} fillOpacity={0.9} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Heatmap */}
        <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "#1C1C1C" }}>Monthly GL Heatmap</h3>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-center text-xs" style={{ color: "#6B6B6B" }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() - 1 }).map((_, i) => <div key={`e${i}`} />)}
            {heatmapData.map(({ date, gl }) => (
              <div
                key={date}
                className="aspect-square rounded flex items-center justify-center text-xs transition-colors"
                style={{ backgroundColor: glToColor(gl), color: gl && gl > 70 ? "white" : "#6B6B6B" }}
                title={gl ? `${gl} GL` : "No data"}
              >
                {date}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs" style={{ color: "#6B6B6B" }}>Less</span>
            {["#EDE8DF", "#6A9E72", "#3D6B4F", "#C4673A"].map(c => (
              <div key={c} className="w-4 h-4 rounded" style={{ backgroundColor: c }} />
            ))}
            <span className="text-xs" style={{ color: "#6B6B6B" }}>More GL</span>
          </div>
        </div>

        {/* GL by Meal Type */}
        <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "#1C1C1C" }}>GL by Meal Type (avg)</h3>
          <div className="flex flex-col gap-4">
            {mealTypeData.map(({ meal, gl, color }) => (
              <div key={meal}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "#1C1C1C" }}>{meal}</span>
                  <span className="font-semibold" style={{ color }}>{gl} GL</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#EDE8DF" }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((gl / 50) * 100, 100)}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}