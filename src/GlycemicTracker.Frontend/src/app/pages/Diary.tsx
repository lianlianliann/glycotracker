import { useState, useRef, useEffect } from "react";
import { TickSlider } from "../components/TickSlider";
import { MEAL_COLORS, multColor, PREP_METHOD_LIST } from "../constants";
import {
  ChevronLeft, ChevronRight, Plus, MoreHorizontal, Pencil, Trash2,
  Flame, Wind, Snowflake, Droplets, Leaf, Clock, X, Check, CalendarDays,
  Search, ChefHat, CheckCircle2,
} from "lucide-react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// ─── Types ────────────────────────────────────────────────
interface Entry {
  id: number;
  name: string;
  local: string;
  grams: number;
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  prep: string;
  prepIcon: string;
  multiplier: string;
  baseGI: number;
  adjGI: number;
  gl: number;
  color: string;
}

// ─── Mock data ────────────────────────────────────────────
const initialEntries: Entry[] = [
  { id: 1, name: "Pandesal", local: "Filipino Bread Roll", grams: 60, meal: "Breakfast", prep: "Baked", prepIcon: "clock", multiplier: "×1.10", baseGI: 75, adjGI: 82.5, gl: 13.8, color: "#C4673A" },
  { id: 2, name: "Scrambled Egg", local: "Itlog", grams: 80, meal: "Breakfast", prep: "Frying / Deep Fried", prepIcon: "flame", multiplier: "×1.15", baseGI: 0, adjGI: 0, gl: 0, color: "#3D6B4F" },
  { id: 3, name: "White Rice", local: "Kanin", grams: 200, meal: "Lunch", prep: "Boiling / Cooled", prepIcon: "droplets", multiplier: "×0.95", baseGI: 72, adjGI: 68.4, gl: 30.8, color: "#D4923A" },
  { id: 4, name: "Milkfish", local: "Bangus", grams: 150, meal: "Lunch", prep: "Grilling", prepIcon: "flame", multiplier: "×1.03", baseGI: 40, adjGI: 41.2, gl: 8.2, color: "#3D6B4F" },
  { id: 5, name: "Kangkong", local: "Water Spinach", grams: 100, meal: "Lunch", prep: "Sautéing / Roasting", prepIcon: "flame", multiplier: "×1.05", baseGI: 15, adjGI: 15.8, gl: 1.4, color: "#6A9E72" },
  { id: 6, name: "Sweet Potato", local: "Kamote", grams: 120, meal: "Snack", prep: "Boiling / Cooled", prepIcon: "droplets", multiplier: "×0.95", baseGI: 63, adjGI: 59.9, gl: 13.5, color: "#D4923A" },
];

const MEAL_ORDER: Entry["meal"][] = ["Breakfast", "Lunch", "Dinner", "Snack"];

const PREP_METHODS = PREP_METHOD_LIST.map(p => p.label);
const MEAL_TYPES: Entry["meal"][] = ["Breakfast", "Lunch", "Dinner", "Snack"];

// ─── Small helpers ─────────────────────────────────────────
function PrepIcon({ type, size = 11 }: { type: string; size?: number }) {
  if (type === "flame") return <Flame size={size} />;
  if (type === "snowflake") return <Snowflake size={size} />;
  if (type === "wind") return <Wind size={size} />;
  if (type === "leaf") return <Leaf size={size} />;
  if (type === "clock") return <Clock size={size} />;
  if (type === "chef") return <ChefHat size={size} />;
  return <Droplets size={size} />;
}

function glColor(gl: number) {
  if (gl > 20) return "#C4673A";
  if (gl > 10) return "#D4923A";
  return "#3D6B4F";
}

// ─── Edit Modal ────────────────────────────────────────────
interface EditModalProps {
  entry: Entry;
  onSave: (updated: Entry) => void;
  onClose: () => void;
}

function EditModal({ entry, onSave, onClose }: EditModalProps) {
  const [grams, setGrams] = useState(entry.grams);
  const [prep, setPrep] = useState(entry.prep);
  const [meal, setMeal] = useState<Entry["meal"]>(entry.meal);

  const handleSave = () => {
    onSave({ ...entry, grams, prep, meal });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#EDE8DF" }}>
          <div>
            <div className="font-bold" style={{ color: "#1C1C1C" }}>Edit entry</div>
            <div className="text-xs italic mt-0.5" style={{ color: "#6B6B6B" }}>{entry.name} · {entry.local}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: "#6B6B6B" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#EDE8DF")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}>
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-5">
          {/* Grams */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: "#1C1C1C" }}>Portion size</label>
              <span className="text-sm font-bold" style={{ color: "#3D6B4F" }}>{grams}g</span>
            </div>
            <TickSlider min={10} max={600} value={grams} onChange={setGrams} numTicks={10} />
            <div className="flex gap-2 mt-2 flex-wrap">
              {[50, 100, 150, 200, 300].map(g => (
                <button key={g} onClick={() => setGrams(g)}
                  className="px-2.5 py-1 rounded-full text-xs border transition-all"
                  style={{ borderColor: grams === g ? "#3D6B4F" : "#EDE8DF", backgroundColor: grams === g ? "#E8F5EC" : "transparent", color: grams === g ? "#3D6B4F" : "#6B6B6B" }}>
                  {g}g
                </button>
              ))}
            </div>
          </div>

          {/* Prep method */}
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: "#1C1C1C" }}>Preparation method</label>
            <div className="grid grid-cols-3 gap-1.5">
              {PREP_METHODS.map(m => (
                <button key={m} onClick={() => setPrep(m)}
                  className="py-1.5 rounded-lg text-xs border transition-all text-center"
                  style={{ borderColor: prep === m ? "#3D6B4F" : "#EDE8DF", backgroundColor: prep === m ? "#E8F5EC" : "transparent", color: prep === m ? "#3D6B4F" : "#6B6B6B", fontWeight: prep === m ? 600 : 400 }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Meal type */}
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: "#1C1C1C" }}>Meal type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {MEAL_TYPES.map(m => (
                <button key={m} onClick={() => setMeal(m)}
                  className="py-1.5 rounded-lg text-xs border transition-all text-center"
                  style={{ borderColor: meal === m ? "#3D6B4F" : "#EDE8DF", backgroundColor: meal === m ? "#E8F5EC" : "transparent", color: meal === m ? "#3D6B4F" : "#6B6B6B", fontWeight: meal === m ? 600 : 400 }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* GL preview */}
          <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "#F5F2ED" }}>
            <span className="text-sm" style={{ color: "#6B6B6B" }}>Estimated GL</span>
            <span className="font-bold text-base" style={{ color: glColor(entry.gl), fontVariantNumeric: "tabular-nums" }}>
              ~{((entry.baseGI * grams) / 1000).toFixed(1)} GL
            </span>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
            style={{ borderColor: "#EDE8DF", color: "#6B6B6B" }}>
            Cancel
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: "#3D6B4F" }}>
            <Check size={14} /> Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Quick food + prep data for the Add Food modal ────────
const QUICK_FOODS = [
  { id: 1, name: "White Rice", local: "Kanin", gi: 72, color: "#D4923A" },
  { id: 2, name: "Brown Rice", local: "Kayumangging Bigas", gi: 55, color: "#6A9E72" },
  { id: 3, name: "Milkfish", local: "Bangus", gi: 40, color: "#3D6B4F" },
  { id: 4, name: "Sweet Potato", local: "Kamote", gi: 63, color: "#D4923A" },
  { id: 5, name: "Water Spinach", local: "Kangkong", gi: 15, color: "#6A9E72" },
  { id: 6, name: "Banana", local: "Saging", gi: 51, color: "#D4923A" },
  { id: 7, name: "Pandesal", local: "Filipino Bread Roll", gi: 75, color: "#C4673A" },
  { id: 8, name: "Bitter Melon", local: "Ampalaya", gi: 25, color: "#3D6B4F" },
];

const QUICK_PREPS = PREP_METHOD_LIST as unknown as { id: string; label: string; multiplier: number; icon: string }[];

// ─── Add Food Modal ────────────────────────────────────────
interface AddFoodModalProps {
  onAdd: (entry: Entry) => void;
  onClose: () => void;
}

function AddFoodModal({ onAdd, onClose }: AddFoodModalProps) {
  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<typeof QUICK_FOODS[0] | null>(null);
  const [selectedPrep, setSelectedPrep] = useState<typeof QUICK_PREPS[0] | null>(null);
  const [grams, setGrams] = useState(150);
  const [meal, setMeal] = useState<Entry["meal"]>("Lunch");

  const filtered = query
    ? QUICK_FOODS.filter(f =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.local.toLowerCase().includes(query.toLowerCase())
      )
    : QUICK_FOODS;

  const adjGI = selectedFood && selectedPrep ? selectedFood.gi * selectedPrep.multiplier : 0;
  const netCarbs = selectedFood ? (selectedFood.gi * grams) / 10000 * 100 : 0;
  const finalGL = selectedFood && selectedPrep ? (adjGI * netCarbs) / 100 : 0;

  const handleAdd = () => {
    if (!selectedFood || !selectedPrep) return;
    const newEntry: Entry = {
      id: Date.now(),
      name: selectedFood.name,
      local: selectedFood.local,
      grams,
      meal,
      prep: selectedPrep.label,
      prepIcon: selectedPrep.icon,
      multiplier: `×${selectedPrep.multiplier.toFixed(2)}`,
      baseGI: selectedFood.gi,
      adjGI: parseFloat(adjGI.toFixed(1)),
      gl: parseFloat(finalGL.toFixed(1)),
      color: selectedFood.color,
    };
    onAdd(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full md:max-w-[520px] rounded-t-2xl md:rounded-2xl overflow-hidden" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.25)", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid #EDE8DF" }}>
          <div>
            <div className="font-bold" style={{ color: "#1C1C1C" }}>Add food to diary</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B6B6B" }}>Log a new meal entry for today</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#6B6B6B" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#EDE8DF")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">

          {/* Search food */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Search size={13} style={{ color: "#3D6B4F" }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#3D6B4F" }}>Search ingredient</span>
            </div>
            <div className="relative mb-2">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B6B6B" }} />
              <input
                type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Type a food name or Filipino term..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: "#EDE8DF" }}
                onFocus={e => (e.target.style.borderColor = "#3D6B4F")}
                onBlur={e => (e.target.style.borderColor = "#EDE8DF")}
              />
            </div>
            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #EDE8DF" }}>
              {filtered.slice(0, 5).map(food => (
                <button
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                  style={{ borderBottom: "1px solid #F5F2ED", backgroundColor: selectedFood?.id === food.id ? "#E8F5EC" : "white" }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: food.color }}>
                    {food.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: "#1C1C1C" }}>{food.name}</div>
                    <div className="text-xs italic" style={{ color: "#6B6B6B" }}>{food.local}</div>
                  </div>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#EDE8DF", color: "#6B6B6B", fontVariantNumeric: "tabular-nums" }}>
                    GI {food.gi}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prep method */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ChefHat size={13} style={{ color: "#3D6B4F" }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#3D6B4F" }}>Preparation method</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {QUICK_PREPS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPrep(p)}
                  className="py-2 px-1 rounded-lg text-xs text-center transition-all"
                  style={{
                    border: selectedPrep?.id === p.id ? "1px solid #3D6B4F" : "1px solid #EDE8DF",
                    backgroundColor: selectedPrep?.id === p.id ? "#E8F5EC" : "white",
                    color: selectedPrep?.id === p.id ? "#3D6B4F" : "#6B6B6B",
                    fontWeight: selectedPrep?.id === p.id ? 600 : 400,
                  }}
                >
                  {p.label}
                  <span className="block text-xs font-bold" style={{ color: multColor(p.multiplier), fontVariantNumeric: "tabular-nums" }}>
                    ×{p.multiplier.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Portion + meal type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#3D6B4F" }}>Grams</label>
                <span className="text-xs font-bold" style={{ color: "#3D6B4F", fontVariantNumeric: "tabular-nums" }}>{grams}g</span>
              </div>
              <TickSlider min={10} max={500} value={grams} onChange={setGrams} numTicks={8} />
              <div className="flex gap-1.5 mt-2">
                {[100, 150, 200, 300].map(g => (
                  <button key={g} onClick={() => setGrams(g)}
                    className="flex-1 py-1 rounded text-xs font-medium"
                    style={{ border: grams === g ? "1px solid #3D6B4F" : "1px solid #EDE8DF", backgroundColor: grams === g ? "#E8F5EC" : "white", color: grams === g ? "#3D6B4F" : "#6B6B6B" }}>
                    {g}g
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "#3D6B4F" }}>Meal type</label>
              <div className="grid grid-cols-2 gap-1">
                {(["Breakfast", "Lunch", "Dinner", "Snack"] as Entry["meal"][]).map(m => (
                  <button key={m} onClick={() => setMeal(m)}
                    className="py-1.5 rounded-lg text-xs text-center"
                    style={{ border: meal === m ? "1px solid #3D6B4F" : "1px solid #EDE8DF", backgroundColor: meal === m ? "#E8F5EC" : "white", color: meal === m ? "#3D6B4F" : "#6B6B6B", fontWeight: meal === m ? 600 : 400 }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GL preview strip */}
          {selectedFood && selectedPrep && (
            <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #1A3829, #2D5540)" }}>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{grams}g {selectedFood.name} · {selectedPrep.label}</div>
              <div className="font-bold text-lg text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
                {finalGL.toFixed(1)} <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.5)" }}>GL</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 shrink-0" style={{ borderTop: "1px solid #EDE8DF" }}>
          <button
            onClick={handleAdd}
            disabled={!selectedFood || !selectedPrep}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              backgroundColor: selectedFood && selectedPrep ? "#3D6B4F" : "#EDE8DF",
              color: selectedFood && selectedPrep ? "white" : "#6B6B6B",
              cursor: selectedFood && selectedPrep ? "pointer" : "not-allowed",
            }}
          >
            <CheckCircle2 size={15} />
            Add to diary
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Diary page ───────────────────────────────────────
export function Diary() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 10)); // Jun 10 2026
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCalendar) return;
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCalendar]);

  const glToday = entries.reduce((s, e) => s + e.gl, 0);
  const glTarget = 100;
  const glPct = Math.min(glToday / glTarget, 1);
  const glStatusColor = glToday > glTarget ? "#C4673A" : glToday > 80 ? "#D4923A" : "#3D6B4F";

  const grouped = MEAL_ORDER.reduce<Record<string, Entry[]>>((acc, meal) => {
    const items = entries.filter(e => e.meal === meal);
    if (items.length > 0) acc[meal] = items;
    return acc;
  }, {});

  const deleteEntry = (id: number) => {
    setEntries(es => es.filter(e => e.id !== id));
    setOpenMenuId(null);
  };

  const saveEntry = (updated: Entry) => {
    setEntries(es => es.map(e => e.id === updated.id ? updated : e));
  };

  const addEntry = (entry: Entry) => {
    setEntries(es => [...es, entry]);
  };

  const today = new Date(2026, 5, 10);
  const isToday = isSameDay(currentDate, today);
  const dateLabel = isToday ? `Today, ${format(currentDate, "MMM d")}` : format(currentDate, "EEE, MMM d");

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8 relative">
      {/* ── Date Navigation ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1C1C1C" }}>Food Diary</h1>
          <p className="text-xs mt-0.5" style={{ color: "#6B6B6B" }}>Your full log for {dateLabel}</p>
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setCurrentDate(d => subDays(d, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
            style={{ borderColor: "#EDE8DF", color: "#6B6B6B" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#EDE8DF")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Clickable date label — opens calendar */}
          <div className="relative" ref={calendarRef}>
            <button
              onClick={() => setShowCalendar(v => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: showCalendar ? "#3D6B4F" : "#EDE8DF", color: showCalendar ? "white" : "#1C1C1C", minWidth: 140, justifyContent: "center" }}
            >
              <CalendarDays size={13} />
              {dateLabel}
            </button>

            {/* Calendar popup */}
            {showCalendar && (
              <div
                className="absolute right-0 top-11 z-50 rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.18)", border: "1px solid #EDE8DF", backgroundColor: "white" }}
              >
                <DayPicker
                  mode="single"
                  selected={currentDate}
                  onSelect={d => {
                    if (d) { setCurrentDate(d); setShowCalendar(false); }
                  }}
                  defaultMonth={currentDate}
                  styles={{
                    root: { margin: 0, padding: "12px 16px 16px" },
                    caption: { color: "#1C1C1C" },
                    nav_button: { color: "#3D6B4F" },
                    day_selected: { backgroundColor: "#3D6B4F", color: "white", borderRadius: "8px" },
                    day_today: { color: "#3D6B4F", fontWeight: 700 },
                  }}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setCurrentDate(d => addDays(d, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
            style={{ borderColor: "#EDE8DF", color: "#6B6B6B" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#EDE8DF")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Daily GL Summary ──────────────────────────────── */}
      <div
        className="rounded-xl p-5 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A3829, #3D6B4F)", boxShadow: "0 4px 20px rgba(61,107,79,0.25)" }}
      >
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(111,212,154,0.2) 0%, transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Total Daily GL</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-bold text-white" style={{ fontVariantNumeric: "tabular-nums" }}>{glToday.toFixed(1)}</span>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>/ {glTarget} GL target</span>
            </div>
          </div>
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: glToday > glTarget ? "rgba(196,103,58,0.25)" : "rgba(111,212,154,0.2)", color: glToday > glTarget ? "#F5A07A" : "#6FD49A", border: `1px solid ${glToday > glTarget ? "rgba(196,103,58,0.3)" : "rgba(111,212,154,0.3)"}` }}
          >
            {glToday > glTarget ? `${(glToday - glTarget).toFixed(1)} over target` : `${(glTarget - glToday).toFixed(1)} GL remaining`}
          </span>
        </div>
        <div className="relative z-10 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${glPct * 100}%`, backgroundColor: glStatusColor, boxShadow: `0 0 10px ${glStatusColor}88` }}
          />
        </div>
        <div className="relative z-10 flex justify-between mt-1.5">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>0</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{glTarget} GL</span>
        </div>
      </div>

      {/* ── Meal Sections ──────────────────────────────────── */}
      {Object.entries(grouped).map(([meal, items]) => {
        const mealGL = items.reduce((s, e) => s + e.gl, 0);
        const mealColor = MEAL_COLORS[meal] ?? "#6B6B6B";
        return (
          <div key={meal} className="bg-white rounded-xl mb-4 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
            {/* Meal header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #F5F2ED" }}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mealColor }} />
                <span className="font-semibold text-sm" style={{ color: "#1C1C1C" }}>{meal}</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${mealColor}18`, color: mealColor }}>
                {mealGL.toFixed(1)} GL
              </span>
            </div>

            {/* Entry rows */}
            {items.map(entry => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-5 py-3 border-b last:border-0 relative transition-colors"
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
                  <div className="text-xs italic" style={{ color: "#6B6B6B" }}>{entry.local} · {entry.grams}g</div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0" style={{ backgroundColor: "#EDE8DF" }}>
                  <PrepIcon type={entry.prepIcon} />
                  <span style={{ color: "#6B6B6B" }}>{entry.prep}</span>
                  <span style={{ color: multColor(parseFloat(entry.multiplier.replace("×", ""))), fontVariantNumeric: "tabular-nums" }}>
                    {entry.multiplier}
                  </span>
                </div>
                <div className="text-right shrink-0 w-16">
                  <div className="text-xs mb-0.5" style={{ color: "#6B6B6B" }}>GI {entry.baseGI}→{entry.adjGI}</div>
                  <div className="font-bold text-sm" style={{ color: glColor(entry.gl), fontVariantNumeric: "tabular-nums" }}>
                    {entry.gl} GL
                  </div>
                </div>

                {/* ··· Menu */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === entry.id ? null : entry.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: "#6B6B6B" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#EDE8DF")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                  >
                    <MoreHorizontal size={15} />
                  </button>
                  {openMenuId === entry.id && (
                    <div
                      className="absolute right-0 top-9 w-36 rounded-xl overflow-hidden z-20"
                      style={{ backgroundColor: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.14)", border: "1px solid #EDE8DF" }}
                    >
                      <button
                        onClick={() => { setEditingEntry(entry); setOpenMenuId(null); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left"
                        style={{ color: "#1C1C1C" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#F5F2ED")}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                      >
                        <Pencil size={13} style={{ color: "#3D6B4F" }} /> Edit entry
                      </button>
                      <div style={{ height: 1, backgroundColor: "#EDE8DF" }} />
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left"
                        style={{ color: "#C4673A" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FAEAE3")}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {entries.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🥗</div>
          <div className="font-semibold mb-1" style={{ color: "#1C1C1C" }}>No entries yet</div>
          <div className="text-sm" style={{ color: "#6B6B6B" }}>Tap the button below to log your first meal.</div>
        </div>
      )}

      {/* ── FAB ───────────────────────────────────────────── */}
      <div className="fixed bottom-8 right-8 z-30">
        <button
          onClick={() => setShowAddFood(true)}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #3D6B4F, #2D5540)", boxShadow: "0 6px 24px rgba(61,107,79,0.4)" }}
        >
          <Plus size={18} />
          Add Food
        </button>
      </div>

      {/* Click-outside to close menu */}
      {openMenuId !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}

      {/* ── Edit Modal ────────────────────────────────────── */}
      {editingEntry && (
        <EditModal
          entry={editingEntry}
          onSave={saveEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}

      {/* ── Add Food Modal ────────────────────────────────── */}
      {showAddFood && (
        <AddFoodModal
          onAdd={addEntry}
          onClose={() => setShowAddFood(false)}
        />
      )}
    </div>
  );
}
