import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search, Flame, Snowflake, Wind, Droplets, ChefHat, Clock, Leaf,
  X, BookOpen, Check,
} from "lucide-react";
import { TickSlider } from "../components/TickSlider";
import { MEAL_COLORS, multColor, PREP_METHOD_LIST } from "../constants";

const foods = [
  { id: 1, name: "White Rice", local: "Kanin", gi: 72 },
  { id: 2, name: "Brown Rice", local: "Kayumangging Bigas", gi: 55 },
  { id: 3, name: "Milkfish", local: "Bangus", gi: 40 },
  { id: 4, name: "Sweet Potato", local: "Kamote", gi: 63 },
  { id: 5, name: "Water Spinach", local: "Kangkong", gi: 15 },
  { id: 6, name: "Pork Belly", local: "Liempo", gi: 0 },
  { id: 7, name: "Bitter Melon", local: "Ampalaya", gi: 25 },
  { id: 8, name: "Banana", local: "Saging", gi: 51 },
  { id: 9, name: "Cassava", local: "Kamoteng Kahoy", gi: 46 },
  { id: 10, name: "Pandesal", local: "Filipino Bread Roll", gi: 75 },
];

const prepMethods = PREP_METHOD_LIST.map(p => ({
  ...p,
  color: multColor(p.multiplier),
}));

const FOOD_COLORS: Record<string, string> = {
  "White Rice": "#D4923A",
  "Brown Rice": "#6A9E72",
  "Milkfish": "#3D6B4F",
  "Sweet Potato": "#D4923A",
  "Water Spinach": "#6A9E72",
  "Pork Belly": "#6B6B6B",
  "Bitter Melon": "#3D6B4F",
  "Banana": "#D4923A",
  "Cassava": "#C4673A",
  "Pandesal": "#C4673A",
};

const CARD_BORDER = "1px solid #E2DDD6";

function PrepIcon({ type, size = 16 }: { type: string; size?: number }) {
  const p = { size };
  switch (type) {
    case "flame": return <Flame {...p} />;
    case "snowflake": return <Snowflake {...p} />;
    case "wind": return <Wind {...p} />;
    case "droplets": return <Droplets {...p} />;
    case "clock": return <Clock {...p} />;
    case "leaf": return <Leaf {...p} />;
    default: return <ChefHat {...p} />;
  }
}

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

interface SuccessData {
  food: string;
  local: string;
  grams: number;
  gl: number;
  baseGI: number;
  adjGI: number;
  prep: string;
  prepMultiplier: number;
  meal: string;
}

export function LogFood() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<typeof foods[0] | null>(null);
  const [selectedPrep, setSelectedPrep] = useState<typeof prepMethods[0] | null>(null);
  const [grams, setGrams] = useState(200);
  const [meal, setMeal] = useState("Lunch");
  const [successModal, setSuccessModal] = useState<SuccessData | null>(null);

  const filtered = query
    ? foods.filter(f =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.local.toLowerCase().includes(query.toLowerCase())
      )
    : foods;

  const netCarbs = selectedFood ? (selectedFood.gi * grams) / 10000 * 100 : 0;
  const adjGI = selectedFood && selectedPrep ? selectedFood.gi * selectedPrep.multiplier : 0;
  const finalGL = selectedFood && selectedPrep ? (adjGI * netCarbs) / 100 : 0;

  const resetForm = () => {
    setQuery("");
    setSelectedFood(null);
    setSelectedPrep(null);
    setGrams(200);
    setMeal("Lunch");
  };

  const handleLog = () => {
    if (!selectedFood || !selectedPrep) return;
    setSuccessModal({
      food: selectedFood.name,
      local: selectedFood.local,
      grams,
      gl: finalGL,
      baseGI: selectedFood.gi,
      adjGI,
      prep: selectedPrep.label,
      prepMultiplier: selectedPrep.multiplier,
      meal,
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#1C1C1C" }}>Log a food entry</h1>

      {/* ── Success Modal ──────────────────────────────────── */}
      {successModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[400px] overflow-hidden"
            style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
          >
            {/* Centered check header */}
            <div className="flex flex-col items-center pt-8 pb-4 px-6">
              {/* Circle check */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                style={{ background: "linear-gradient(135deg, #3D6B4F, #6A9E72)", boxShadow: "0 4px 20px rgba(61,107,79,0.35)" }}
              >
                <Check size={30} color="white" strokeWidth={2.5} />
              </div>
              {/* "Logged!" badge */}
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: "#E8F5EC", border: "1px solid #B5DBC0" }}
              >
                <Check size={11} style={{ color: "#3D6B4F" }} />
                <span className="text-sm font-bold" style={{ color: "#3D6B4F" }}>Logged!</span>
              </div>
              <p className="text-sm text-center" style={{ color: "#6B6B6B" }}>
                Successfully added to today's Food Diary.
              </p>
              {/* X close */}
              <button
                onClick={() => { setSuccessModal(null); resetForm(); }}
                className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: "#6B6B6B", position: "absolute", top: 16, right: 16 }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#EDE8DF")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
              >
                <X size={15} />
              </button>
            </div>

            {/* Food entry card */}
            <div className="px-5 pb-4">
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px dashed #C8C3BC" }}
              >
                {/* Food info row */}
                <div className="flex items-start gap-3 p-4">
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: FOOD_COLORS[successModal.food] ?? "#6B6B6B" }}
                  >
                    {successModal.food[0]}
                  </div>
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: "#1C1C1C" }}>{successModal.food}</div>
                    <div className="text-xs italic" style={{ color: "#6B6B6B" }}>{successModal.local}</div>
                  </div>
                  {/* GI panel */}
                  <div
                    className="text-right shrink-0 pl-3"
                    style={{ borderLeft: "1px dashed #C8C3BC" }}
                  >
                    <div className="text-xs" style={{ color: "#6B6B6B" }}>GI</div>
                    <div className="text-sm font-bold" style={{ color: "#1C1C1C", fontVariantNumeric: "tabular-nums" }}>
                      {successModal.baseGI} → {successModal.adjGI.toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
                  <span className="text-xs" style={{ color: "#6B6B6B" }}>Portion</span>
                  <span className="text-xs font-semibold" style={{ color: "#1C1C1C" }}>{successModal.grams}g</span>
                  <div className="w-px h-3" style={{ backgroundColor: "#E2DDD6" }} />
                  <span className="text-xs" style={{ color: "#6B6B6B" }}>Meal</span>
                  <span className="text-xs font-semibold" style={{ color: "#1C1C1C" }}>{successModal.meal}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded ml-auto"
                    style={{ border: "1px solid #E2DDD6", color: "#6B6B6B" }}
                  >
                    {successModal.prep} ×{successModal.prepMultiplier.toFixed(2)}
                  </span>
                </div>

                {/* Dashed separator */}
                <div style={{ borderTop: "1px dashed #C8C3BC" }} />

                {/* GL total */}
                <div className="px-4 py-3 text-right">
                  <span
                    className="font-bold"
                    style={{ fontSize: 22, color: "#1C1C1C", fontVariantNumeric: "tabular-nums" }}
                  >
                    {successModal.gl.toFixed(1)} GL
                  </span>
                </div>
              </div>

              <p className="text-xs text-center mt-3 mb-4" style={{ color: "#6B6B6B" }}>
                Success! Item added. Review your entries or add another?
              </p>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setSuccessModal(null); resetForm(); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                  style={{ borderColor: "#E2DDD6", color: "#6B6B6B" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#F5F2ED")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                >
                  Undo &amp; Clear Form
                </button>
                <button
                  onClick={() => navigate("/diary")}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #3D6B4F, #2D5540)" }}
                >
                  <BookOpen size={13} />
                  View Food Diary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Search ingredient */}
          <div className="bg-white rounded-xl p-6" style={{ border: CARD_BORDER }}>
            <div className="flex items-center gap-2 mb-4">
              <Search size={15} style={{ color: "#3D6B4F" }} />
              <span className="font-semibold text-sm" style={{ color: "#3D6B4F" }}>Search ingredient</span>
            </div>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B6B6B" }} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or Filipino term..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                style={{ borderColor: "#E2DDD6" }}
                onFocus={e => (e.target.style.borderColor = "#3D6B4F")}
                onBlur={e => (e.target.style.borderColor = "#E2DDD6")}
              />
            </div>
            <div className="rounded-lg overflow-hidden" style={{ border: CARD_BORDER }}>
              {filtered.slice(0, 6).map(food => (
                <button
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                  style={{
                    borderBottom: "1px solid #F0EDE8",
                    backgroundColor: selectedFood?.id === food.id ? "#E8F5EC" : "white",
                  }}
                  onMouseEnter={e => { if (selectedFood?.id !== food.id) (e.currentTarget as HTMLElement).style.backgroundColor = "#FAFAF8"; }}
                  onMouseLeave={e => { if (selectedFood?.id !== food.id) (e.currentTarget as HTMLElement).style.backgroundColor = "white"; }}
                >
                  <div>
                    <div className="font-medium text-sm" style={{ color: "#1C1C1C" }}>{food.name}</div>
                    <div className="text-xs italic" style={{ color: "#6B6B6B" }}>{food.local}</div>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: selectedFood?.id === food.id ? "#3D6B4F" : "#F0EDE8",
                      color: selectedFood?.id === food.id ? "white" : "#6B6B6B",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    GI {food.gi}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preparation method */}
          <div className="bg-white rounded-xl p-6" style={{ border: CARD_BORDER }}>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat size={15} style={{ color: "#3D6B4F" }} />
              <span className="font-semibold text-sm" style={{ color: "#3D6B4F" }}>Preparation method</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {prepMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPrep(method)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all"
                  style={{
                    border: selectedPrep?.id === method.id ? `2px solid ${method.color}` : "1px solid #E2DDD6",
                    backgroundColor: selectedPrep?.id === method.id ? (method.color === "#C4673A" ? "#FAEAE3" : "#E8F5EC") : "white",
                  }}
                >
                  <div style={{ color: method.color }}>
                    <PrepIcon type={method.icon} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: "#1C1C1C" }}>{method.label}</span>
                  <span className="text-xs font-bold" style={{ color: method.color, fontVariantNumeric: "tabular-nums" }}>
                    ×{method.multiplier.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Portion & meal type */}
          <div className="bg-white rounded-xl p-6" style={{ border: CARD_BORDER }}>
            <div className="flex items-center gap-2 mb-4">
              <Droplets size={15} style={{ color: "#3D6B4F" }} />
              <span className="font-semibold text-sm" style={{ color: "#3D6B4F" }}>Portion &amp; meal type</span>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: "#1C1C1C" }}>Grams</span>
                <span className="font-bold text-sm" style={{ color: "#3D6B4F", fontVariantNumeric: "tabular-nums" }}>{grams}g</span>
              </div>
              <TickSlider min={50} max={500} value={grams} onChange={setGrams} numTicks={9} />
              <div className="flex gap-2 mt-3 flex-wrap">
                {[100, 150, 200, 300].map(g => (
                  <button
                    key={g}
                    onClick={() => setGrams(g)}
                    className="px-3 py-1 rounded text-xs font-semibold transition-all"
                    style={{
                      border: grams === g ? "1px solid #3D6B4F" : "1px solid #E2DDD6",
                      backgroundColor: grams === g ? "#E8F5EC" : "white",
                      color: grams === g ? "#3D6B4F" : "#6B6B6B",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {g}g
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: "#1C1C1C" }}>Meal type</label>
              <select
                value={meal} onChange={e => setMeal(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{ border: "1px solid #E2DDD6" }}
                onFocus={e => (e.target.style.borderColor = "#3D6B4F")}
                onBlur={e => (e.target.style.borderColor = "#E2DDD6")}
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snack</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Digital Scale GL Preview Card ─────────────────── */}
        <div className="lg:col-span-1">
          <div
            className="rounded-xl sticky top-24 relative overflow-hidden"
            style={{ background: "linear-gradient(160deg, #111E17 0%, #1A3829 40%, #243F30 100%)" }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: GRAIN_SVG, backgroundSize: "200px 200px", opacity: 0.045, mixBlendMode: "overlay" }}
            />
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />

            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>
                  Live GL Preview
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded font-bold"
                  style={{ backgroundColor: "rgba(111,212,154,0.12)", color: "#6FD49A", border: "1px solid rgba(111,212,154,0.2)", fontVariantNumeric: "tabular-nums" }}
                >
                  {meal}
                </span>
              </div>

              <div
                className="text-5xl font-bold text-white mb-1"
                style={{ fontVariantNumeric: "tabular-nums", fontFeatureSettings: '"tnum"', letterSpacing: "-1px" }}
              >
                {selectedFood && selectedPrep ? finalGL.toFixed(1) : "—"}
              </div>
              <div className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>GL UNITS</div>

              <div className="flex flex-col gap-0" style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
                {[
                  { label: "Base GI", value: selectedFood ? `${selectedFood.gi}` : "—" },
                  { label: "After prep", value: selectedPrep && selectedFood ? `${(selectedFood.gi * selectedPrep.multiplier).toFixed(1)}` : "—" },
                  { label: "Net carbs", value: selectedFood ? `${netCarbs.toFixed(1)}g` : "—" },
                ].map(({ label, value }, i) => (
                  <div
                    key={label}
                    className="flex justify-between px-3 py-2.5 text-sm"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                    <span className="font-semibold text-white" style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px dashed rgba(255,255,255,0.2)" }} />
                <div
                  className="flex justify-between px-3 py-3 text-sm"
                  style={{ backgroundColor: "rgba(111,212,154,0.06)" }}
                >
                  <span className="font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>Final GL</span>
                  <span
                    className="font-bold text-base"
                    style={{ color: "#6FD49A", fontVariantNumeric: "tabular-nums", textShadow: "0 0 12px rgba(111,212,154,0.5)" }}
                  >
                    {selectedFood && selectedPrep ? finalGL.toFixed(1) : "—"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLog}
                disabled={!selectedFood || !selectedPrep}
                className="w-full mt-5 py-3 rounded-lg font-bold text-sm transition-all"
                style={{
                  backgroundColor: selectedFood && selectedPrep ? "#6FD49A" : "rgba(255,255,255,0.08)",
                  color: selectedFood && selectedPrep ? "#111E17" : "rgba(255,255,255,0.3)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  letterSpacing: "0.03em",
                  cursor: selectedFood && selectedPrep ? "pointer" : "not-allowed",
                }}
              >
                Log this entry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
