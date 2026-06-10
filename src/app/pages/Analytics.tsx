import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp, Target, Calendar, Lightbulb } from "lucide-react";
import { MEAL_COLORS } from "../constants";

const weekData = [
  { day: "Mon", gl: 82 },
  { day: "Tue", gl: 95 },
  { day: "Wed", gl: 107 },
  { day: "Thu", gl: 88 },
  { day: "Fri", gl: 74 },
  { day: "Sat", gl: 112 },
  { day: "Sun", gl: 54 },
];

const mealTypeData = [
  { meal: "Breakfast", gl: 21, color: MEAL_COLORS.Breakfast },
  { meal: "Lunch",     gl: 42, color: MEAL_COLORS.Lunch     },
  { meal: "Dinner",    gl: 28, color: MEAL_COLORS.Dinner    },
  { meal: "Snacks",    gl: 11, color: MEAL_COLORS.Snack     },
];

const heatmapData = (() => {
  const days: { date: number; gl: number | null }[] = [];
  for (let i = 1; i <= 30; i++) {
    days.push({ date: i, gl: i > 10 ? null : Math.floor(Math.random() * 80) + 40 });
  }
  return days;
})();

function glToColor(gl: number | null) {
  if (gl === null) return "#FAF7F2";
  if (gl > 100) return "#C4673A";
  if (gl > 80) return "#3D6B4F";
  if (gl > 60) return "#6A9E72";
  return "#EDE8DF";
}

export function Analytics() {
  const [period, setPeriod] = useState("Last 7 days");

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
          <option>Last 90 days</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Avg Daily GL",
            value: "87",
            unit: "GL",
            chip: "↓ 8% vs prev week",
            chipColor: "#3D6B4F",
            chipBg: "#E8F5EC",
            icon: TrendingDown,
          },
          {
            label: "Days on Target",
            value: "5",
            unit: "/ 7",
            chip: "Good progress",
            chipColor: "#3D6B4F",
            chipBg: "#E8F5EC",
            icon: Target,
          },
          {
            label: "Peak GL Day",
            value: "112",
            unit: "GL",
            chip: "Saturday",
            chipColor: "#C4673A",
            chipBg: "#FAEAE3",
            icon: TrendingUp,
          },
          {
            label: "Best Day",
            value: "54",
            unit: "GL",
            chip: "Sunday",
            chipColor: "#3D6B4F",
            chipBg: "#E8F5EC",
            icon: Calendar,
          },
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
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>Jun 1–7</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData} barSize={40}>
              <XAxis key="x" dataKey="day" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} axisLine={false} tickLine={false} />
              <YAxis key="y" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} />
              <ReferenceLine key="ref" y={100} stroke="#F5C46A" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "Target", position: "right", fontSize: 10, fill: "#F5C46A" }} />
              <Bar
                key="bar"
                dataKey="gl"
                shape={(props: any) => {
                  const { x, y, width, height, value } = props;
                  const fill = value > 100 ? "#F5A07A" : "#6FD49A";
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
          <h3 className="font-semibold mb-4" style={{ color: "#1C1C1C" }}>Monthly GL Heatmap — June 2026</h3>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-center text-xs" style={{ color: "#6B6B6B" }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for June starting on Monday */}
            {Array.from({ length: 0 }).map((_, i) => <div key={`e${i}`} />)}
            {heatmapData.map(({ date, gl }) => (
              <div
                key={date}
                className="aspect-square rounded flex items-center justify-center text-xs"
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
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(gl / 60) * 100}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insight Card */}
      <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#FEF3E2" }}>
            <Lightbulb size={18} style={{ color: "#D4923A" }} />
          </div>
          <div>
            <h3 className="font-semibold mb-1" style={{ color: "#1C1C1C" }}>GL Insight</h3>
            <p className="text-sm" style={{ color: "#6B6B6B" }}>
              Your Saturday GL is consistently your highest — averaging 112 GL over the past 3 weeks.
              Consider swapping white rice for brown rice (Kayumangging Bigas) at lunch to bring it under your 100 GL target.
              Steaming instead of boiling can also reduce the glycemic impact by ~10%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
