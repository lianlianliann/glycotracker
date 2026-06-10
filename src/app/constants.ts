// ─── Meal type colors ─────────────────────────────────────────────────────────
// Single source of truth for all meal-type color coding in the app.
export const MEAL_COLORS: Record<string, string> = {
  Breakfast: "#D4923A",
  Lunch:     "#3D6B4F",
  Dinner:    "#2D5A8E",
  Snack:     "#C4673A",
};

// ─── Prep method multiplier color ─────────────────────────────────────────────
// ≤ 1.00 → accent green   > 1.00 → terracotta
export function multColor(multiplier: number): string {
  return multiplier <= 1.0 ? "#6A9E72" : "#C4673A";
}

// ─── Canonical prep method list ───────────────────────────────────────────────
export const PREP_METHOD_LIST = [
  { id: "frozen",        label: "Frozen Overnight",       multiplier: 0.80, icon: "snowflake" },
  { id: "refrigerated",  label: "Refrigerated Overnight", multiplier: 0.85, icon: "snowflake" },
  { id: "stewing",       label: "Stewing",                multiplier: 0.92, icon: "droplets"  },
  { id: "boiled",        label: "Boiling / Cooled",       multiplier: 0.95, icon: "droplets"  },
  { id: "steamed",       label: "Steaming",               multiplier: 0.98, icon: "wind"      },
  { id: "smoking",       label: "Smoking",                multiplier: 1.00, icon: "flame"     },
  { id: "standard",      label: "Standard / Newly Cooked",multiplier: 1.00, icon: "chef"      },
  { id: "raw",           label: "Raw",                    multiplier: 0.85, icon: "leaf"      },
  { id: "grilled",       label: "Grilling",               multiplier: 1.03, icon: "flame"     },
  { id: "sauteed",       label: "Sautéing / Roasting",   multiplier: 1.05, icon: "flame"     },
  { id: "baked",         label: "Baked",                  multiplier: 1.10, icon: "clock"     },
  { id: "fried",         label: "Frying / Deep Fried",    multiplier: 1.15, icon: "flame"     },
  { id: "stirfried",     label: "Stir-Fried",             multiplier: 1.20, icon: "wind"      },
] as const;
