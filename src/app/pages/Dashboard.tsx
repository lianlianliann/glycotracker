import { Link } from "react-router";
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from "recharts";
import { Zap, Beef, Droplets, ChevronRight, Flame, Snowflake, Wind } from "lucide-react";
import { MEAL_COLORS, multColor } from "../constants";

const weekData = [
  { day: "Mon", gl: 82 },
  { day: "Tue", gl: 95 },
  { day: "Wed", gl: 107 },
  { day: "Thu", gl: 88 },
  { day: "Fri", gl: 74 },
  { day: "Sat", gl: 112 },
  { day: "Sun", gl: 54 },
];

const entries = [
  { id: 1, name: "White Rice", local: "Kanin", grams: 200, meal: "Lunch", prep: "Boiling / Cooled", prepIcon: "droplets", multiplier: "×0.95", baseGI: 72, adjGI: 68.4, gl: 30.8 },
  { id: 2, name: "Milkfish", local: "Bangus", grams: 150, meal: "Lunch", prep: "Grilling", prepIcon: "flame", multiplier: "×1.03", baseGI: 40, adjGI: 41.2, gl: 8.2 },
  { id: 3, name: "Kangkong", local: "Water Spinach", grams: 100, meal: "Lunch", prep: "Sautéing / Roasting", prepIcon: "flame", multiplier: "×1.05", baseGI: 15, adjGI: 15.8, gl: 1.4 },
  { id: 4, name: "Pandesal", local: "Filipino Bread Roll", grams: 60, meal: "Breakfast", prep: "Baked", prepIcon: "flame", multiplier: "×1.10", baseGI: 75, adjGI: 82.5, gl: 13.8 },
];

function GlIcon({ type }: { type: string }) {
  if (type === "flame") return <Flame size={11} />;
  if (type === "snowflake") return <Snowflake size={11} />;
  return <Wind size={11} />;
}

function CircleRing({ value, target }: { value: number; target: number }) {
  const pct = Math.min(value / target, 1);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const color = pct > 1 ? "#C4673A" : pct > 0.8 ? "#D4923A" : "#3D6B4F";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#EDE8DF" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold" style={{ color: "#1C1C1C" }}>{value}</div>
        <div className="text-xs" style={{ color: "#6B6B6B" }}>/ {target} GL</div>
        <div className="text-xs mt-0.5" style={{ color: "#6B6B6B" }}>today</div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const glToday = 54;
  const glTarget = 100;
  const remaining = glTarget - glToday;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#1C1C1C" }}>Hi, Juan! 👋</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B6B6B" }}>Here's your glycemic snapshot for today.</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold" style={{ color: "#1C1C1C" }}>Sat, Jun 6</div>
          <div className="text-xs mt-0.5" style={{ color: "#6B6B6B" }}>Week 23 · 2026</div>
        </div>
      </div>

      {/* GL Progress Card — glossy dark green */}
      <div
        className="rounded-xl p-6 mb-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A3829 0%, #2D5540 55%, #3D6B4F 100%)", boxShadow: "0 6px 28px rgba(61,107,79,0.35)" }}
      >
        {/* Gloss orbs */}
        <div className="absolute top-[-50px] right-[-40px] w-52 h-52 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(111,212,154,0.18) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-30px] left-[40%] w-36 h-36 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(212,146,58,0.12) 0%, transparent 70%)" }} />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Ring — inverted colors for dark bg */}
          <div className="relative inline-flex items-center justify-center shrink-0">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
              <circle
                cx="70" cy="70" r="52" fill="none" stroke="#6FD49A" strokeWidth="10"
                strokeDasharray={2 * Math.PI * 52} strokeDashoffset={2 * Math.PI * 52 * (1 - Math.min(glToday / glTarget, 1))}
                strokeLinecap="round" transform="rotate(-90 70 70)"
                style={{ filter: "drop-shadow(0 0 8px rgba(111,212,154,0.55))" }}
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-2xl font-bold text-white">{glToday}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>/ {glTarget} GL</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>today</div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <h3 className="font-semibold mb-4 text-white">Meal Breakdown</h3>
            {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((label) => {
              const glMap: Record<string, number> = { Breakfast: 13.8, Lunch: 40.4, Dinner: 0, Snack: 0 };
              const maxMap: Record<string, number> = { Breakfast: 30, Lunch: 50, Dinner: 40, Snack: 20 };
              const gl = glMap[label]; const max = maxMap[label]; const color = MEAL_COLORS[label];
              return (
              <div key={label} className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{label}</span>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{gl} GL</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(gl / max) * 100}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}88` }}
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
            {remaining} GL remaining — on track
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "GL Today", value: "54", unit: "units", icon: Zap, color: "#3D6B4F", bg: "linear-gradient(135deg, #E8F5EC, #F0FAF2)", accent: "rgba(61,107,79,0.12)" },
          { label: "Protein", value: "62", unit: "g", icon: Beef, color: "#D4923A", bg: "linear-gradient(135deg, #FEF3E2, #FFF8EE)", accent: "rgba(212,146,58,0.12)" },
          { label: "Fat", value: "18", unit: "g", icon: Droplets, color: "#6A9E72", bg: "linear-gradient(135deg, #EDF5EF, #F4FAF5)", accent: "rgba(106,158,114,0.12)" },
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
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: "#EDE8DF", color: "#6B6B6B" }}>Jun 1 – 6</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekData} barSize={32}>
            <XAxis key="x" dataKey="day" tick={{ fontSize: 11, fill: "#6B6B6B" }} axisLine={false} tickLine={false} />
            <YAxis key="y" hide />
            <ReferenceLine key="ref" y={100} stroke="#D4923A" strokeDasharray="4 3" strokeWidth={1.5} />
            <Bar
              key="bar"
              dataKey="gl"
              shape={(props: any) => {
                const { x, y, width, height, value } = props;
                const fill = value > 100 ? "#C4673A" : "#3D6B4F";
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
        <div className="flex flex-col gap-1">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-b last:border-0 transition-colors"
              style={{ borderColor: "#F5F2ED" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FAFAF8")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: MEAL_COLORS[entry.meal] ?? "#6B6B6B", boxShadow: `0 2px 8px ${MEAL_COLORS[entry.meal] ?? "#6B6B6B"}44` }}
              >
                {entry.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm" style={{ color: "#1C1C1C" }}>{entry.name}</div>
                <div className="text-xs italic" style={{ color: "#6B6B6B" }}>{entry.local} · {entry.grams}g · {entry.meal}</div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0" style={{ backgroundColor: "#EDE8DF" }}>
                <GlIcon type={entry.prepIcon} />
                <span style={{ color: "#6B6B6B" }}>{entry.prep}</span>
                <span style={{ color: multColor(parseFloat(entry.multiplier.replace("×", ""))), fontVariantNumeric: "tabular-nums" }}>
                  {entry.multiplier}
                </span>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs mb-0.5" style={{ color: "#6B6B6B" }}>GI {entry.baseGI} → {entry.adjGI}</div>
                <div className="font-bold text-sm" style={{ color: entry.gl > 20 ? "#C4673A" : entry.gl > 10 ? "#D4923A" : "#3D6B4F", fontVariantNumeric: "tabular-nums" }}>
                  {entry.gl} GL
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
