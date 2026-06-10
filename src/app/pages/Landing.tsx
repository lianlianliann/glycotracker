import { Link } from "react-router";
import { Leaf, ArrowRight, Flame, Snowflake, Wind, Droplets } from "lucide-react";

const filipinoFoods = [
  { name: "Kanin", english: "White Rice", gi: 72, gl: 32.4, level: "high" },
  { name: "Kamote", english: "Sweet Potato", gi: 63, gl: 14.2, level: "medium" },
  { name: "Bangus", english: "Milkfish", gi: 40, gl: 7.2, level: "low" },
  { name: "Ampalaya", english: "Bitter Melon", gi: 25, gl: 1.8, level: "low" },
  { name: "Saging", english: "Banana", gi: 51, gl: 12.4, level: "medium" },
  { name: "Kamoteng Kahoy", english: "Cassava", gi: 46, gl: 10.1, level: "low" },
  { name: "Pandesal", english: "Bread Roll", gi: 75, gl: 13.8, level: "high" },
  { name: "Kangkong", english: "Water Spinach", gi: 15, gl: 1.4, level: "low" },
];

const prepVariants = [
  { method: "Refrigerated Overnight", multiplier: 0.85, gl: 27.5, icon: "snowflake", color: "#6A9E72", bg: "#E8F5EC" },
  { method: "Boiling / Cooled",       multiplier: 0.95, gl: 30.8, icon: "droplets",  color: "#6A9E72", bg: "#EDF5EF" },
  { method: "Baked",                  multiplier: 1.10, gl: 35.6, icon: "flame",     color: "#C4673A", bg: "#FAEAE3" },
  { method: "Frying / Deep Fried",    multiplier: 1.15, gl: 37.3, icon: "flame",     color: "#C4673A", bg: "#FDE8E0" },
];

function glColor(level: string) {
  if (level === "high") return "#C4673A";
  if (level === "medium") return "#D4923A";
  return "#3D6B4F";
}

function PrepIcon({ type }: { type: string }) {
  const s = { size: 13 };
  switch (type) {
    case "flame": return <Flame {...s} />;
    case "wind": return <Wind {...s} />;
    case "droplets": return <Droplets {...s} />;
    default: return <Leaf {...s} />;
  }
}

export function Landing() {
  return (
    <div style={{ backgroundColor: "#FAF7F2" }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A3829 0%, #2D5540 50%, #3D6B4F 100%)" }}
      >
        {/* Glossy orb accents */}
        <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #6A9E72 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-60px] right-[200px] w-[260px] h-[260px] rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, #D4923A 0%, transparent 70%)" }} />

        <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left */}
          <div>
            <div
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-8"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#A8D1B3", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
            >
              <Leaf size={11} /> Para sa mga Pilipino
            </div>
            <h1 className="text-6xl font-bold leading-none mb-6 tracking-tight text-white">
              Know your<br />
              <span style={{ color: "#6FD49A", textShadow: "0 0 40px rgba(111,212,154,0.4)" }}>glycemic</span><br />
              load.
            </h1>
            <p className="text-base mb-8 max-w-md" style={{ color: "#A8C4B4", lineHeight: "1.7" }}>
              GlycoTrack is the only tracker that adjusts for <em>how</em> you cook —
              not just what's on your plate. Built around 500+ Filipino foods.
            </p>
            <div className="flex gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #6FD49A, #3D6B4F)", color: "white", boxShadow: "0 4px 20px rgba(111,212,154,0.35)" }}
              >
                Get started free <ArrowRight size={15} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Right — glossy app preview */}
          <div className="relative">
            {/* GL Progress card — glass */}
            <div
              className="rounded-2xl p-5 mb-3"
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #D4923A, #C4673A)" }}>K</div>
                <div>
                  <div className="font-semibold text-sm text-white">Kanin</div>
                  <div className="text-xs italic" style={{ color: "rgba(255,255,255,0.55)" }}>White Rice · 200g · Lunch</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>GI 72 → 57.6</div>
                  <div className="text-lg font-bold" style={{ color: "#F5B95A", fontVariantNumeric: "tabular-nums" }}>26.8 GL</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["Steamed ×0.8", "200g", "Lunch"].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.15)" }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Daily target card — glass */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-white">Today's GL</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "rgba(111,212,154,0.2)", color: "#6FD49A", border: "1px solid rgba(111,212,154,0.3)" }}>On track</span>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-bold text-white" style={{ fontVariantNumeric: "tabular-nums" }}>54</span>
                <span className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>/ 100 GL target</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <div className="h-full rounded-full" style={{ width: "54%", background: "linear-gradient(90deg, #6FD49A, #3D6B4F)", boxShadow: "0 0 12px rgba(111,212,154,0.5)" }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>46 GL remaining</span>
                <span className="text-xs font-medium" style={{ color: "#6FD49A" }}>54%</span>
              </div>
            </div>

            {/* Floating badge */}
            <div
              className="absolute -top-3 -right-4 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#F5B95A",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}
            >
              <Flame size={13} /> 7-day streak
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ──────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="h-px" style={{ backgroundColor: "#EDE8DF" }} />
      </div>

      {/* ── PREP METHOD SECTION ───────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#6A9E72" }}>The core idea</div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#1C1C1C" }}>
              Same rice.<br />Very different blood sugar.
            </h2>
            <p className="text-sm mb-6" style={{ color: "#6B6B6B", lineHeight: "1.8" }}>
              How you cook changes your food's glycemic load — sometimes dramatically.
              Steaming vs. frying the same amount of Kanin produces a 53% difference in GL impact.
              No other tracker accounts for this.
            </p>
            <Link to="/register" className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: "#3D6B4F" }}>
              See how it works <ArrowRight size={14} />
            </Link>
          </div>

          {/* Prep variants visual */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-medium mb-1 px-1" style={{ color: "#6B6B6B" }}>Kanin (White Rice) · 200g</div>
            {prepVariants.map(({ method, multiplier, gl, icon, color, bg }) => (
              <div key={method} className="flex items-center gap-4 bg-white rounded-xl px-4 py-3" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-2 w-28 shrink-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
                    <span style={{ color }}><PrepIcon type={icon} /></span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#1C1C1C" }}>{method}</span>
                </div>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#EDE8DF" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(gl / 45) * 100}%`, backgroundColor: color }} />
                </div>
                <div className="text-right shrink-0 w-16">
                  <div className="font-bold text-sm" style={{ color, fontVariantNumeric: "tabular-nums" }}>{gl} GL</div>
                  <div className="text-xs" style={{ color: "#6B6B6B" }}>×{multiplier}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOD SHOWCASE ─────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "#F2EDE5" }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#6A9E72" }}>Filipino food database</div>
              <h2 className="text-3xl font-bold" style={{ color: "#1C1C1C" }}>Foods you grew up eating.<br />Now tracked properly.</h2>
            </div>
            <span className="text-sm hidden md:block" style={{ color: "#6B6B6B" }}>500+ local foods indexed</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filipinoFoods.map(food => (
              <div key={food.name} className="bg-white rounded-xl p-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: glColor(food.level) }}>
                    {food.name[0]}
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: glColor(food.level) + "20", color: glColor(food.level) }}>
                    {food.gl} GL
                  </span>
                </div>
                <div className="font-bold text-sm" style={{ color: "#1C1C1C" }}>{food.name}</div>
                <div className="text-xs italic" style={{ color: "#6B6B6B" }}>{food.english}</div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#EDE8DF" }}>
                  <div style={{ width: `${(food.gi / 80) * 100}%`, backgroundColor: glColor(food.level), height: "100%", borderRadius: "9999px" }} />
                </div>
                <div className="text-xs mt-1" style={{ color: "#6B6B6B" }}>GI {food.gi}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="grid grid-cols-3 gap-8 text-center">
          {[
            { num: "500+", label: "Filipino foods indexed", sub: "English & local names" },
            { num: "11", label: "Cooking methods", sub: "Each adjusts GL differently" },
            { num: "Real-time", label: "GL preview", sub: "Updates as you choose prep" },
          ].map(({ num, label, sub }) => (
            <div key={label}>
              <div className="text-4xl font-bold mb-1" style={{ color: "#3D6B4F" }}>{num}</div>
              <div className="font-semibold text-sm mb-0.5" style={{ color: "#1C1C1C" }}>{label}</div>
              <div className="text-xs" style={{ color: "#6B6B6B" }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 pb-20">
        <div className="rounded-2xl p-12 flex flex-col md:flex-row items-center justify-between gap-6" style={{ backgroundColor: "#3D6B4F" }}>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to eat smarter?</h2>
            <p className="text-sm" style={{ color: "#A8D1B3" }}>Free forever. No credit card required.</p>
          </div>
          <Link
            to="/register"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "white", color: "#3D6B4F" }}
          >
            Create free account <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #EDE8DF" }}>
        <div className="max-w-[1280px] mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: "#3D6B4F" }}>
              <Leaf size={12} color="white" />
            </div>
            <span className="font-semibold text-sm" style={{ color: "#3D6B4F" }}>GlycoTrack</span>
          </div>
          <p className="text-xs" style={{ color: "#6B6B6B" }}>© 2026 GlycoTrack · Eat smarter. Track glycemic load.</p>
        </div>
      </footer>
    </div>
  );
}
