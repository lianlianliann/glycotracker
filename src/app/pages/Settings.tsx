import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Key, Download, Globe, Trash2 } from "lucide-react";
import { TickSlider } from "../components/TickSlider";
import { EditProfileModal, type ProfileData } from "../components/EditProfileModal";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative w-10 h-6 rounded-full transition-colors"
      style={{ backgroundColor: on ? "#3D6B4F" : "#EDE8DF" }}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
        style={{ left: on ? "calc(100% - 20px)" : "4px" }}
      />
    </button>
  );
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function Settings() {
  const navigate = useNavigate();

  // Profile state — in a real app this would come from the DB/auth context
  const [profile, setProfile] = useState<ProfileData>({
    name: "Juan dela Cruz",
    email: "juan@email.com",
    weight: "72",
    activity: "Moderately Active",
    condition: "Prediabetes",
  });

  const [showEditProfile, setShowEditProfile] = useState(false);

  // Goal targets (set by onboarding or manually)
  const [glTarget, setGlTarget] = useState(80);
  const [calorieTarget, setCalorieTarget] = useState(2100);
  const [proteinTarget, setProteinTarget] = useState(72);

  const [prefs, setPrefs] = useState({
    glReminder: true,
    mealReminders: false,
    weeklyReport: true,
    showFilipino: true,
  });

  const togglePref = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSaveProfile = (updated: ProfileData, recalculate: boolean) => {
    setProfile(updated);
    if (recalculate) {
      // Simple recalc: adjust GL target based on condition
      const newGL = updated.condition === "General Health" ? 100
        : updated.condition === "Prediabetes" ? 80
        : updated.condition === "Type 1 Diabetes" ? 70
        : 60;
      setGlTarget(newGL);
      // Rough calorie adjustment by weight
      const w = Number(updated.weight) || 72;
      const mult = updated.activity === "Sedentary" ? 1.2
        : updated.activity === "Lightly Active" ? 1.375
        : updated.activity === "Moderately Active" ? 1.55
        : 1.725;
      setCalorieTarget(Math.round(w * 25 * mult));
      setProteinTarget(Math.round(w * (updated.condition === "General Health" ? 0.8 : updated.condition === "Prediabetes" ? 1.0 : 1.2)));
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#1C1C1C" }}>Settings</h1>

      {/* ── Profile — glossy ──────────────────────────────── */}
      <div
        className="rounded-xl p-6 mb-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A3829 0%, #2D5540 55%, #3D6B4F 100%)", boxShadow: "0 6px 28px rgba(61,107,79,0.35)" }}
      >
        <div className="absolute top-[-40px] right-[-30px] w-44 h-44 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(111,212,154,0.2) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-20px] left-[30%] w-32 h-32 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(212,146,58,0.1) 0%, transparent 70%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", fontSize: 17 }}
            >
              {initials(profile.name)}
            </div>
            <div className="flex-1">
              <div className="font-bold text-white">{profile.name}</div>
              <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>{profile.email}</div>
              <span
                className="inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                {profile.condition}
              </span>
            </div>
            <button
              onClick={() => setShowEditProfile(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.22)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.12)")}
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>

      {/* ── Goals ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-6 mb-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        <h2 className="font-semibold mb-4" style={{ color: "#1C1C1C" }}>Goals</h2>
        <div className="flex flex-col gap-6">
          {[
            { label: "Daily GL target", value: glTarget, unit: "GL", min: 50, max: 200, set: setGlTarget, ticks: 10 },
            { label: "Daily calorie target", value: calorieTarget, unit: "kcal", min: 1000, max: 4000, set: setCalorieTarget, ticks: 12 },
            { label: "Daily protein target", value: proteinTarget, unit: "g", min: 20, max: 300, set: setProteinTarget, ticks: 10 },
          ].map(({ label, value, unit, min, max, set, ticks }) => (
            <div key={label}>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: "#1C1C1C" }}>{label}</label>
                <span className="text-sm font-semibold" style={{ color: "#3D6B4F", fontVariantNumeric: "tabular-nums" }}>{value} {unit}</span>
              </div>
              <TickSlider min={min} max={max} value={value} onChange={set} numTicks={ticks} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Preferences ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-6 mb-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        <h2 className="font-semibold mb-4" style={{ color: "#1C1C1C" }}>Preferences</h2>
        <div className="flex flex-col gap-4">
          {[
            { key: "glReminder" as const, label: "Daily GL reminder", desc: "Get notified when you're close to your daily limit" },
            { key: "mealReminders" as const, label: "Meal logging reminders", desc: "Reminders to log breakfast, lunch, and dinner" },
            { key: "weeklyReport" as const, label: "Weekly report", desc: "Receive a weekly summary of your GL trends" },
            { key: "showFilipino" as const, label: "Show local Filipino names", desc: "Display Filipino food names alongside English" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium" style={{ color: "#1C1C1C" }}>{label}</div>
                <div className="text-xs" style={{ color: "#6B6B6B" }}>{desc}</div>
              </div>
              <Toggle on={prefs[key]} onChange={() => togglePref(key)} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Account ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-2 mb-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        <h2 className="font-semibold px-4 pt-3 pb-2" style={{ color: "#1C1C1C" }}>Account</h2>
        {[
          { icon: Key, label: "Change password", desc: null },
          { icon: Download, label: "Export my data", desc: "Download all meal logs as CSV" },
          { icon: Globe, label: "Timezone", desc: "Asia/Manila" },
        ].map(({ icon: Icon, label, desc }) => (
          <button
            key={label}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-50 text-left border-b"
            style={{ borderColor: "#F5F2ED" }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#EDE8DF" }}>
              <Icon size={15} style={{ color: "#6B6B6B" }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: "#1C1C1C" }}>{label}</div>
              {desc && <div className="text-xs" style={{ color: "#6B6B6B" }}>{desc}</div>}
            </div>
            <ChevronRight size={15} style={{ color: "#6B6B6B" }} />
          </button>
        ))}
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors hover:bg-red-50">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FAEAE3" }}>
            <Trash2 size={15} style={{ color: "#C4673A" }} />
          </div>
          <span className="text-sm font-medium" style={{ color: "#C4673A" }}>Delete account</span>
          <ChevronRight size={15} className="ml-auto" style={{ color: "#C4673A" }} />
        </button>
      </div>

      {/* ── Sign out ─────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/")}
        className="w-full py-2.5 rounded-lg font-semibold text-sm border transition-colors hover:bg-red-50"
        style={{ borderColor: "#C4673A", color: "#C4673A" }}
      >
        Sign out
      </button>

      {/* ── Edit Profile Modal ───────────────────────────────── */}
      {showEditProfile && (
        <EditProfileModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </div>
  );
}
