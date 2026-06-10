import { useState } from "react";
import { X, Check, AlertTriangle } from "lucide-react";

const ACTIVITY_LEVELS = ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"];
const HEALTH_CONDITIONS = ["General Health", "Prediabetes", "Type 1 Diabetes", "Type 2 Diabetes"];

export interface ProfileData {
  name: string;
  email: string;
  weight: string;
  activity: string;
  condition: string;
}

interface EditProfileModalProps {
  profile: ProfileData;
  onSave: (updated: ProfileData, recalculate: boolean) => void;
  onClose: () => void;
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function EditProfileModal({ profile, onSave, onClose }: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [weight, setWeight] = useState(profile.weight);
  const [activity, setActivity] = useState(profile.activity);
  const [condition, setCondition] = useState(profile.condition);

  // Track if recalculation-triggering fields changed
  const weightChanged = weight !== profile.weight;
  const activityChanged = activity !== profile.activity;
  const needsRecalc = weightChanged || activityChanged;

  const [recalcChoice, setRecalcChoice] = useState<boolean | null>(null);

  const handleSave = () => {
    const updated: ProfileData = { ...profile, name, weight, activity, condition };
    const doRecalc = needsRecalc ? (recalcChoice ?? false) : false;
    onSave(updated, doRecalc);
    onClose();
  };

  const inputBase = "w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors";
  const inputStyle = { borderColor: "#EDE8DF", backgroundColor: "white" };
  const focusGreen = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#3D6B4F");
  const blurNeutral = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#EDE8DF");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[440px] overflow-hidden"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #EDE8DF" }}
        >
          <div>
            <div className="font-bold" style={{ color: "#1C1C1C" }}>Edit profile</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B6B6B" }}>Update your personal information</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "#6B6B6B" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#EDE8DF")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto" style={{ maxHeight: "70vh" }}>
          {/* Avatar + Change Photo */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, #3D6B4F, #6A9E72)", boxShadow: "0 4px 16px rgba(61,107,79,0.3)" }}
            >
              {initials(name || profile.name)}
            </div>
            <button className="text-xs font-semibold" style={{ color: "#3D6B4F" }}>
              Change Photo
            </button>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "#1C1C1C" }}>Full Name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Juan dela Cruz"
              className={inputBase} style={inputStyle}
              onFocus={focusGreen} onBlur={blurNeutral}
            />
          </div>

          {/* Weight */}
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "#1C1C1C" }}>
              Weight
              {weightChanged && (
                <span className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded" style={{ backgroundColor: "#FEF3E2", color: "#D4923A" }}>
                  changed
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="number" value={weight} onChange={e => setWeight(e.target.value)}
                placeholder="65"
                className={inputBase + " pr-8"} style={inputStyle}
                onFocus={focusGreen} onBlur={blurNeutral}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#6B6B6B" }}>kg</span>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "#1C1C1C" }}>
              Activity Level
              {activityChanged && (
                <span className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded" style={{ backgroundColor: "#FEF3E2", color: "#D4923A" }}>
                  changed
                </span>
              )}
            </label>
            <select
              value={activity}
              onChange={e => setActivity(e.target.value)}
              className={inputBase}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "#3D6B4F")}
              onBlur={e => (e.target.style.borderColor = "#EDE8DF")}
            >
              {ACTIVITY_LEVELS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>

          {/* Health Status */}
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "#1C1C1C" }}>Health Status</label>
            <div className="grid grid-cols-2 gap-2">
              {HEALTH_CONDITIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all"
                  style={{
                    border: condition === c ? "1.5px solid #3D6B4F" : "1px solid #EDE8DF",
                    backgroundColor: condition === c ? "#E8F5EC" : "white",
                  }}
                >
                  {condition === c
                    ? <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#3D6B4F" }}><Check size={9} color="white" strokeWidth={3} /></div>
                    : <div className="w-4 h-4 rounded-full shrink-0" style={{ border: "2px solid #D5D0C8" }} />
                  }
                  <span className="text-xs font-medium" style={{ color: condition === c ? "#3D6B4F" : "#1C1C1C" }}>{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recalculation prompt */}
          {needsRecalc && (
            <div
              className="rounded-xl px-4 py-4"
              style={{ backgroundColor: "#FEF8EE", border: "1px solid rgba(212,146,58,0.35)" }}
            >
              <div className="flex items-start gap-2.5 mb-3">
                <AlertTriangle size={15} style={{ color: "#D4923A", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: "#1C1C1C" }}>Recalculate your targets?</div>
                  <div className="text-xs" style={{ color: "#6B6B6B" }}>
                    You updated your {weightChanged && activityChanged ? "weight and activity level" : weightChanged ? "weight" : "activity level"}. Should we recalculate your daily GL and calorie targets?
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setRecalcChoice(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                  style={{
                    borderColor: recalcChoice === false ? "#3D6B4F" : "#EDE8DF",
                    backgroundColor: recalcChoice === false ? "#E8F5EC" : "transparent",
                    color: recalcChoice === false ? "#3D6B4F" : "#6B6B6B",
                  }}
                >
                  Keep current
                </button>
                <button
                  onClick={() => setRecalcChoice(true)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: recalcChoice === true ? "#D4923A" : "#FEF3E2",
                    color: recalcChoice === true ? "white" : "#D4923A",
                    border: `1px solid ${recalcChoice === true ? "#D4923A" : "rgba(212,146,58,0.3)"}`,
                  }}
                >
                  Yes, recalculate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex gap-2 px-6 py-4"
          style={{ borderTop: "1px solid #EDE8DF" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
            style={{ borderColor: "#EDE8DF", color: "#6B6B6B" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "#F5F2ED")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={needsRecalc && recalcChoice === null}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
            style={{
              background: needsRecalc && recalcChoice === null
                ? "#C8C3BC"
                : "linear-gradient(135deg, #3D6B4F, #2D5540)",
              cursor: needsRecalc && recalcChoice === null ? "not-allowed" : "pointer",
            }}
          >
            <Check size={14} /> Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
