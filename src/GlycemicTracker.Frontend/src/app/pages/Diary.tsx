import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { MEAL_COLORS, multColor } from "../constants";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Trash2,
  Flame,
  Wind,
  Snowflake,
  Droplets,
  Leaf,
  Clock,
  CalendarDays,
  ChefHat,
  Loader2,
} from "lucide-react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { supabase } from "../../lib/supabaseClient";

// ─── Helpers ───────────────────────────────────────────────
function getPrepIcon(prep: string) {
  if (!prep) return "chef";
  const lower = prep.toLowerCase();
  if (lower.includes("boil") || lower.includes("steam")) return "droplets";
  if (lower.includes("freeze") || lower.includes("cool")) return "snowflake";
  if (lower.includes("bake") || lower.includes("roast")) return "clock";
  if (lower.includes("fresh") || lower.includes("raw")) return "leaf";
  return "flame";
}

function PrepIcon({ type, size = 11 }: { type: string; size?: number }) {
  if (type === "flame") return <Flame size={size} />;
  if (type === "snowflake") return <Snowflake size={size} />;
  if (type === "wind") return <Wind size={size} />;
  if (type === "leaf") return <Leaf size={size} />;
  if (type === "clock") return <Clock size={size} />;
  if (type === "droplets") return <Droplets size={size} />;
  return <ChefHat size={size} />;
}

function glColor(gl: number) {
  if (gl > 20) return "#C4673A";
  if (gl > 10) return "#D4923A";
  return "#3D6B4F";
}

// ─── Main Diary page ───────────────────────────────────────
export function Diary() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [entries, setEntries] = useState<any[]>([]);
  const [glTarget, setGlTarget] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const API = "https://localhost:7214";

  // ─── Close calendar on click outside
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

  // ─── Fetch entries when date changes
  useEffect(() => {
    const fetchDiary = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch User Target
        const profileRes = await fetch(`${API}/api/user-profile/${user.id}`);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setGlTarget(profile.dailyGlTarget || 100);
        }

        // Fetch Entries for the specific date
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const res = await fetch(`${API}/api/meal-entries?userId=${user.id}&date=${dateStr}`);
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        } else {
          setEntries([]);
        }
      } catch (err) {
        console.error("Failed to load diary", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiary();
  }, [currentDate]);

  const deleteEntry = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch(`${API}/api/meal-entries/${id}?userId=${user.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.entryId !== id));
      }
    } catch (err) {
      console.error("Failed to delete entry", err);
    } finally {
      setOpenMenuId(null);
    }
  };

  const glToday = entries.reduce((s, e) => s + (e.finalGL || 0), 0);
  const glPct = Math.min(glToday / glTarget, 1);
  const glStatusColor = glToday > glTarget ? "#C4673A" : glToday > 80 ? "#D4923A" : "#3D6B4F";

  // Group by MealType, safely handling nulls or unknown types
  const MEAL_ORDER = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const grouped = MEAL_ORDER.reduce<Record<string, any[]>>((acc, meal) => {
    const items = entries.filter((e) => 
      e.mealType && e.mealType.toLowerCase() === meal.toLowerCase()
    );
    if (items.length > 0) acc[meal] = items;
    return acc;
  }, {});

  // Catch any items that didn't fit into the 4 main categories (null, blank, or typos)
  const otherItems = entries.filter((e) => 
    !e.mealType || !MEAL_ORDER.some((m) => m.toLowerCase() === e.mealType.toLowerCase())
  );
  if (otherItems.length > 0) {
    grouped["Other"] = otherItems;
  }

  const today = new Date();
  const isTodayDate = isSameDay(currentDate, today);
  const dateLabel = isTodayDate ? `Today, ${format(currentDate, "MMM d")}` : format(currentDate, "EEE, MMM d");

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8 relative">
      {/* ── Date Navigation ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1C1C1C" }}>
            Food Diary
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#6B6B6B" }}>
            Your full log for {dateLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setCurrentDate((d) => subDays(d, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors hover:bg-gray-100"
            style={{ borderColor: "#EDE8DF", color: "#6B6B6B" }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Clickable date label — opens calendar */}
          <div className="relative" ref={calendarRef}>
            <button
              onClick={() => setShowCalendar((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{
                backgroundColor: showCalendar ? "#3D6B4F" : "#EDE8DF",
                color: showCalendar ? "white" : "#1C1C1C",
                minWidth: 140,
                justifyContent: "center",
              }}
            >
              <CalendarDays size={13} />
              {dateLabel}
            </button>

            {showCalendar && (
              <div
                className="absolute right-0 top-11 z-50 rounded-2xl overflow-hidden bg-white"
                style={{
                  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                  border: "1px solid #EDE8DF",
                }}
              >
                <DayPicker
                  mode="single"
                  selected={currentDate}
                  onSelect={(d) => {
                    if (d) {
                      setCurrentDate(d);
                      setShowCalendar(false);
                    }
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
            onClick={() => setCurrentDate((d) => addDays(d, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors hover:bg-gray-100"
            style={{ borderColor: "#EDE8DF", color: "#6B6B6B" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Daily GL Summary ──────────────────────────────── */}
      <div
        className="rounded-xl p-5 mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1A3829, #3D6B4F)",
          boxShadow: "0 4px 20px rgba(61,107,79,0.25)",
        }}
      >
        <div
          className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(111,212,154,0.2) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
              Total Daily GL
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-bold text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
                {glToday.toFixed(1)}
              </span>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                / {glTarget} GL target
              </span>
            </div>
          </div>
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: glToday > glTarget ? "rgba(196,103,58,0.25)" : "rgba(111,212,154,0.2)",
              color: glToday > glTarget ? "#F5A07A" : "#6FD49A",
              border: `1px solid ${glToday > glTarget ? "rgba(196,103,58,0.3)" : "rgba(111,212,154,0.3)"}`,
            }}
          >
            {glToday > glTarget
              ? `${(glToday - glTarget).toFixed(1)} over target`
              : `${(glTarget - glToday).toFixed(1)} GL remaining`}
          </span>
        </div>
        <div className="relative z-10 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${glPct * 100}%`,
              backgroundColor: glStatusColor,
              boxShadow: `0 0 10px ${glStatusColor}88`,
            }}
          />
        </div>
      </div>

      {/* ── Loading State ─────────────────────────────────── */}
      {isLoading && (
        <div className="flex justify-center items-center py-20 text-gray-400">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {/* ── Meal Sections ──────────────────────────────────── */}
      {!isLoading && Object.entries(grouped).map(([meal, items]) => {
        const mealGL = items.reduce((s, e) => s + (e.finalGL || 0), 0);
        // Fallback color for "Other" category
        const mealColor = MEAL_COLORS[meal as keyof typeof MEAL_COLORS] ?? "#8B8B8B";
        return (
          <div
            key={meal}
            className="bg-white rounded-xl mb-4 overflow-hidden"
            style={{
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #F5F2ED" }}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mealColor }} />
                <span className="font-semibold text-sm" style={{ color: "#1C1C1C" }}>{meal}</span>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${mealColor}18`, color: mealColor }}
              >
                {mealGL.toFixed(1)} GL
              </span>
            </div>

            {items.map((entry) => (
              <div
                key={entry.entryId}
                className="flex items-center gap-3 px-5 py-3 border-b last:border-0 relative transition-colors hover:bg-[#FAFAF8]"
                style={{ borderColor: "#F5F2ED" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{
                    backgroundColor: mealColor,
                    boxShadow: `0 2px 8px ${mealColor}44`,
                  }}
                >
                  {entry.ingredientName?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: "#1C1C1C" }}>
                    {entry.ingredientName}
                  </div>
                  <div className="text-xs italic" style={{ color: "#6B6B6B" }}>
                    {entry.localName} · {entry.gramsConsumed}g
                  </div>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
                  style={{ backgroundColor: "#EDE8DF" }}
                >
                  <PrepIcon type={getPrepIcon(entry.prepMethodName)} />
                  <span style={{ color: "#6B6B6B" }}>{entry.prepMethodName}</span>
                  <span
                    style={{
                      color: multColor(entry.giMultiplier),
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    ×{entry.giMultiplier?.toFixed(2)}
                  </span>
                </div>
                <div className="text-right shrink-0 w-16">
                  <div className="text-xs mb-0.5" style={{ color: "#6B6B6B" }}>
                    GI {entry.baseGI}→{entry.modifiedGI?.toFixed(1)}
                  </div>
                  <div
                    className="font-bold text-sm"
                    style={{
                      color: glColor(entry.finalGL),
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {entry.finalGL?.toFixed(1)} GL
                  </div>
                </div>

                <div className="relative shrink-0">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === entry.entryId ? null : entry.entryId)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#EDE8DF]"
                    style={{ color: "#6B6B6B" }}
                  >
                    <MoreHorizontal size={15} />
                  </button>
                  {openMenuId === entry.entryId && (
                    <div
                      className="absolute right-0 top-9 w-32 rounded-xl overflow-hidden z-20 bg-white"
                      style={{
                        boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                        border: "1px solid #EDE8DF",
                      }}
                    >
                      <button
                        onClick={() => deleteEntry(entry.entryId)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left hover:bg-[#FAEAE3]"
                        style={{ color: "#C4673A" }}
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

      {!isLoading && entries.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🥗</div>
          <div className="font-semibold mb-1" style={{ color: "#1C1C1C" }}>
            No entries found
          </div>
          <div className="text-sm" style={{ color: "#6B6B6B" }}>
            Tap the button below to log a meal for {dateLabel}.
          </div>
        </div>
      )}

      {/* ── Redirect FAB to /log (Fixed from /logfood) ──────────────── */}
      <div className="fixed bottom-8 right-8 z-30">
        <button
          onClick={() => navigate("/log")}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #3D6B4F, #2D5540)",
            boxShadow: "0 6px 24px rgba(61,107,79,0.4)",
          }}
        >
          <Plus size={18} />
          Add Food
        </button>
      </div>

      {/* Click-outside to close menu */}
      {openMenuId !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}