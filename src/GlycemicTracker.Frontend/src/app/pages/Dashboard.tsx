import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from "recharts";
import { Zap, Beef, Droplets, ChevronRight, Flame, Snowflake, Wind } from "lucide-react";
import { MEAL_COLORS, multColor } from "../constants";
import { supabase } from "../../lib/supabaseClient";

// Helper to determine the icon based on the preparation method string
function getPrepIcon(prep: string) {
  if (!prep) return "flame";
  const lower = prep.toLowerCase();
  if (lower.includes("boil") || lower.includes("steam")) return "droplets";
  if (lower.includes("freeze") || lower.includes("cool")) return "snowflake";
  return "flame";
}

function GlIcon({ type }: { type: string }) {
  if (type === "flame") return <Flame size={11} />;
  if (type === "snowflake") return <Snowflake size={11} />;
  return <Wind size={11} />;
}

export function Dashboard() {
  const [glToday, setGlToday] = useState(0);
  const [glTarget, setGlTarget] = useState(100);
  const [weekData, setWeekData] = useState<{ day: string; gl: number }[]>([]);
  
  // New states for Option A
  const [entries, setEntries] = useState<any[]>([]);
  const [mealGl, setMealGl] = useState({ Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 });
  const [macros, setMacros] = useState({ protein: 0, fat: 0 });
  
  const [isLoading, setIsLoading] = useState(true);
  const remaining = Math.max(glTarget - glToday, 0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const API = "https://localhost:7214";

        // 1. Fetch Today's Totals
        const todayRes = await fetch(`${API}/api/dashboard/today?userId=${user.id}`);
        if (todayRes.ok) {
          const todayData = await todayRes.json();
          setGlToday(todayData.totalGl || 0);
          setGlTarget(todayData.dailyGlTarget || 100);
        }

        // 2. Fetch 7-Day Trend
        const weekRes = await fetch(`${API}/api/dashboard/weekly?userId=${user.id}`);
        if (weekRes.ok) {
          const weekRaw = await weekRes.json();
          const formattedWeek = weekRaw.map((item: any) => {
            const dateObj = new Date(item.date);
            const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
            return { day: dayName, gl: item.totalGl };
          });
          setWeekData(formattedWeek);
        }

        // 3. Fetch Today's Meal Entries (Option A Implementation)
        const entriesRes = await fetch(`${API}/api/meal-entries?userId=${user.id}`);
        if (entriesRes.ok) {
          const entriesData = await entriesRes.json();
          setEntries(entriesData);

          // Calculate dynamic Meal Breakdown and Macros from the entries
          let p = 0;
          let f = 0;
          const currentMealGl = { Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 };
          
          entriesData.forEach((entry: any) => {
            if (currentMealGl[entry.mealType as keyof typeof currentMealGl] !== undefined) {
              currentMealGl[entry.mealType as keyof typeof currentMealGl] += entry.finalGL;
            }
            p += entry.proteinConsumed || 0;
            f += entry.fatConsumed || 0;
          });

          setMealGl(currentMealGl);
          setMacros({ protein: Math.round(p), fat: Math.round(f) });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#1C1C1C" }}>Hi there! 👋</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B6B6B" }}>Here's your glycemic snapshot for today.</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold" style={{ color: "#1C1C1C" }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "#6B6B6B" }}>
            {isLoading ? "Syncing..." : "Up to date"}
          </div>
        </div>
      </div>

      {/* GL Progress Card */}
      <div
        className="rounded-xl p-6 mb-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A3829 0%, #2D5540 55%, #3D6B4F 100%)", boxShadow: "0 6px 28px rgba(61,107,79,0.35)" }}
      >
        <div className="absolute top-[-50px] right-[-40px] w-52 h-52 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(111,212,154,0.18) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-30px] left-[40%] w-36 h-36 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(212,146,58,0.12) 0%, transparent 70%)" }} />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative inline-flex items-center justify-center shrink-0">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
              <circle
                cx="70" cy="70" r="52" fill="none" stroke="#6FD49A" strokeWidth="10"
                strokeDasharray={2 * Math.PI * 52} 
                strokeDashoffset={2 * Math.PI * 52 * (1 - Math.min(glToday / glTarget, 1))}
                strokeLinecap="round" transform="rotate(-90 70 70)"
                style={{ filter: "drop-shadow(0 0 8px rgba(111,212,154,0.55))", transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-2xl font-bold text-white">{glToday.toFixed(1)}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>/ {glTarget} GL</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>today</div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <h3 className="font-semibold mb-4 text-white">Meal Breakdown</h3>
            {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((label) => {
              const maxMap: Record<string, number> = { Breakfast: 30, Lunch: 50, Dinner: 40, Snack: 20 };
              const gl = Number(mealGl[label].toFixed(1)); 
              const max = maxMap[label]; 
              const color = MEAL_COLORS[label];
              return (
              <div key={label} className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{label}</span>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{gl} GL</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((gl / max) * 100, 100)}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}88` }}
                  />
                </div>
              </div>
            );})}
          </div>
        </div>

        <div className="mt-5 pt-4 relative z-10" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: "rgba(111,212,154,0.18)", color: "#6FD49A", border: "1px solid rgba(111,212,154,0.3)" }}
          >
            <Zap size={12} />
            {remaining.toFixed(1)} GL remaining — {remaining > 0 ? "on track" : "target reached"}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "GL Today", value: glToday.toFixed(1), unit: "units", icon: Zap, color: "#3D6B4F", bg: "linear-gradient(135deg, #E8F5EC, #F0FAF2)", accent: "rgba(61,107,79,0.12)" },
          { label: "Protein", value: macros.protein, unit: "g", icon: Beef, color: "#D4923A", bg: "linear-gradient(135deg, #FEF3E2, #FFF8EE)", accent: "rgba(212,146,58,0.12)" },
          { label: "Fat", value: macros.fat, unit: "g", icon: Droplets, color: "#6A9E72", bg: "linear-gradient(135deg, #EDF5EF, #F4FAF5)", accent: "rgba(106,158,114,0.12)" },
        ].map(({ label, value, unit, icon: Icon, color, bg, accent }) => (
          <div key={label} className="rounded-xl p-4 bg-white" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${accent}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={15} style={{ color }} />
              </div>
              <span className="text-xs font-medium" style={{ color: "#6B6B6B" }}>{label}</span>
            </div>
            <div>
              <span className="text-2xl font-bold" style={{ color: "#1C1C1C", fontVariantNumeric: "tabular-nums" }}>{value}</span>
              <span className="text-xs ml-1" style={{ color: "#6B6B6B" }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 7-Day GL Trend */}
      <div className="bg-white rounded-xl p-6 mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: "#1C1C1C" }}>7-Day GL Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekData} barSize={32}>
            <XAxis key="x" dataKey="day" tick={{ fontSize: 11, fill: "#6B6B6B" }} axisLine={false} tickLine={false} />
            <YAxis key="y" hide />
            <ReferenceLine key="ref" y={glTarget} stroke="#D4923A" strokeDasharray="4 3" strokeWidth={1.5} />
            <Bar
              key="bar"
              dataKey="gl"
              shape={(props: any) => {
                const { x, y, width, height, value } = props;
                const fill = value > glTarget ? "#C4673A" : "#3D6B4F";
                return (
                  <g>
                    <rect x={x} y={y} width={width} height={Math.max(height, 0)} rx={4} fill={fill} fillOpacity={0.9} />
                    <rect x={x} y={y} width={width} height={6} rx={4} fill={fill} />
                  </g>
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Today's Entries */}
      <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: "#1C1C1C" }}>Today's entries</h3>
          <Link to="/diary" className="text-xs font-semibold flex items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors" style={{ color: "#3D6B4F", backgroundColor: "#E8F5EC" }}>
            See all <ChevronRight size={13} />
          </Link>
        </div>
        
        {entries.length === 0 && !isLoading ? (
          <div className="text-center py-6 text-sm" style={{ color: "#6B6B6B" }}>
            No meals logged yet today.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {entries.map(entry => (
              <div
                key={entry.entryId}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-b last:border-0 transition-colors"
                style={{ borderColor: "#F5F2ED" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FAFAF8")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: MEAL_COLORS[entry.mealType] ?? "#6B6B6B", boxShadow: `0 2px 8px ${MEAL_COLORS[entry.mealType] ?? "#6B6B6B"}44` }}
                >
                  {entry.ingredientName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: "#1C1C1C" }}>{entry.ingredientName}</div>
                  <div className="text-xs italic" style={{ color: "#6B6B6B" }}>{entry.localName} · {entry.gramsConsumed}g · {entry.mealType}</div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0" style={{ backgroundColor: "#EDE8DF" }}>
                  <GlIcon type={getPrepIcon(entry.prepMethodName)} />
                  <span style={{ color: "#6B6B6B" }}>{entry.prepMethodName}</span>
                  <span style={{ color: multColor(entry.giMultiplier), fontVariantNumeric: "tabular-nums" }}>
                    ×{entry.giMultiplier.toFixed(2)}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs mb-0.5" style={{ color: "#6B6B6B" }}>GI {entry.baseGI} → {entry.modifiedGI.toFixed(1)}</div>
                  <div className="font-bold text-sm" style={{ color: entry.finalGL > 20 ? "#C4673A" : entry.finalGL > 10 ? "#D4923A" : "#3D6B4F", fontVariantNumeric: "tabular-nums" }}>
                    {entry.finalGL.toFixed(1)} GL
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}