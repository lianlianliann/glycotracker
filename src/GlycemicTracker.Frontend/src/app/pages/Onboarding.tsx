import { useState } from "react";
import { useNavigate } from "react-router";
import { Leaf, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const ACTIVITY_LEVELS = [
  {
    id: "Sedentary",
    label: "Sedentary",
    desc: "Little or no exercise",
    multiplier: 1.2,
    emoji: "🪑",
  },
  {
    id: "Lightly Active",
    label: "Lightly Active",
    desc: "Light exercise 1–3×/week",
    multiplier: 1.375,
    emoji: "🚶",
  },
  {
    id: "Moderately Active",
    label: "Moderately Active",
    desc: "Moderate exercise 3–5×/week",
    multiplier: 1.55,
    emoji: "🏃",
  },
  {
    id: "Very Active",
    label: "Very Active",
    desc: "Hard exercise 6–7×/week",
    multiplier: 1.725,
    emoji: "🏋️",
  },
];

const HEALTH_CONDITIONS = [
  {
    id: "General Health",
    label: "General Health",
    desc: "No known condition",
    accentColor: "#3D6B4F",
    bg: "#E8F5EC",
  },
  {
    id: "Prediabetes",
    label: "Prediabetes",
    desc: "Blood sugar slightly elevated",
    accentColor: "#D4923A",
    bg: "#FEF3E2",
  },
  {
    id: "Type 1 Diabetes",
    label: "Type 1 Diabetes",
    desc: "Insulin-dependent diabetes",
    accentColor: "#C4673A",
    bg: "#FAEAE3",
  },
  {
    id: "Type 2 Diabetes",
    label: "Type 2 Diabetes",
    desc: "Insulin resistance / metabolic",
    accentColor: "#C4673A",
    bg: "#FAEAE3",
  },
];

// Maps onboarding condition labels to DB CHECK constraint values
const CONDITION_TO_DIABETES_TYPE: Record<string, string> = {
  "General Health": "none",
  Prediabetes: "prediabetes",
  "Type 1 Diabetes": "type1",
  "Type 2 Diabetes": "type2",
};

// Maps onboarding activity labels to DB CHECK constraint values
const ACTIVITY_TO_DB_VALUE: Record<string, string> = {
  Sedentary: "sedentary",
  "Lightly Active": "lightly_active",
  "Moderately Active": "moderately_active",
  "Very Active": "very_active",
};

function calcTargets(
  age: number,
  sex: string,
  height: number,
  weight: number,
  activity: string,
  condition: string,
) {
  const bmr =
    sex === "Male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  const mult =
    ACTIVITY_LEVELS.find((a) => a.id === activity)?.multiplier ?? 1.375;
  const calories = Math.round(bmr * mult);
  const proteinMult =
    condition === "General Health"
      ? 0.8
      : condition === "Prediabetes"
        ? 1.0
        : 1.2;
  const protein = Math.round(weight * proteinMult);
  const gl =
    condition === "General Health"
      ? 100
      : condition === "Prediabetes"
        ? 80
        : condition === "Type 1 Diabetes"
          ? 70
          : 60;
  const gi = Math.round(gl * 1.5);
  return { calories, protein, gl, gi };
}

const STEPS = [
  { label: "Biodata", desc: "Your physical metrics" },
  { label: "Health Status", desc: "Your condition profile" },
  { label: "Your Targets", desc: "Personalized goals" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 state
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"Male" | "Female" | "">("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("");

  // Step 2 state
  const [condition, setCondition] = useState("");

  const canNext1 = !!(age && sex && height && weight && activity);
  const canNext2 = !!condition;

  const targets =
    canNext1 && canNext2
      ? calcTargets(
          Number(age),
          sex,
          Number(height),
          Number(weight),
          activity,
          condition,
        )
      : null;

  const handleFinish = async () => {
    if (!targets) return;
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setSubmitError("Session expired. Please log in again.");
        setIsSubmitting(false);
        navigate("/login");
        return;
      }

      // Display name: prefer value saved during Register, fallback to Supabase user metadata
      const displayName =
        localStorage.getItem("glycotrack_display_name") ??
        (user.user_metadata?.display_name as string | undefined) ??
        "";

      const diabetesType = CONDITION_TO_DIABETES_TYPE[condition] ?? "none";
      const activityLevel = ACTIVITY_TO_DB_VALUE[activity] ?? activity;
      const API = import.meta.env.VITE_API_URL;

      const res = await fetch(`${API}/api/user-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          displayName: displayName,
          dailyGlTarget: targets.gl,
          dailyGiTarget: targets.gi,
          timezone:
            Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Manila",
          diabetesType: diabetesType,
          height: Number(height),
          weight: Number(weight),
          activityLevel: activityLevel,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(
          body?.error ?? `Failed to save profile (${res.status}).`,
        );
        setIsSubmitting(false);
        return;
      }

      localStorage.removeItem("glycotrack_pending_onboarding");
      localStorage.removeItem("glycotrack_display_name");

      navigate("/dashboard");
    } catch (err) {
      setSubmitError(
        "Network error. Please check your connection and try again.",
      );
      setIsSubmitting(false);
    }
  };

  const inputBase =
    "w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors";
  const inputStyle = { borderColor: "#EDE8DF", backgroundColor: "white" };
  const focusGreen = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = "#3D6B4F");
  const blurNeutral = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = "#EDE8DF");

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FAF7F2" }}>
      {/* ── Left panel ──────────────────────────────────── */}
      <div
        className="hidden md:flex w-72 shrink-0 flex-col"
        style={{
          background:
            "linear-gradient(180deg, #1A3829 0%, #243F30 55%, #1A3829 100%)",
        }}
      >
        <div
          className="absolute top-[-40px] left-[-20px] w-48 h-48 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(111,212,154,0.18) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 p-8 pb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Leaf size={15} color="white" />
            </div>
            <span className="font-bold text-white">GlycoTrack</span>
          </div>
          <p
            className="text-xs mt-4 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Let's set up your profile to personalize your glycemic load targets.
          </p>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 gap-6">
          {STEPS.map((s, i) => {
            const num = i + 1;
            const active = step === num;
            const done = step > num;
            return (
              <div key={s.label} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  {i > 0 && (
                    <div
                      className="w-px h-6 -mt-6 mb-0"
                      style={{
                        backgroundColor: done
                          ? "rgba(111,212,154,0.5)"
                          : "rgba(255,255,255,0.12)",
                      }}
                    />
                  )}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: done
                        ? "#6FD49A"
                        : active
                          ? "rgba(255,255,255,0.18)"
                          : "rgba(255,255,255,0.07)",
                      border: `2px solid ${done ? "#6FD49A" : active ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)"}`,
                    }}
                  >
                    {done ? (
                      <Check size={15} color="#1A3829" strokeWidth={2.5} />
                    ) : (
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: active ? "white" : "rgba(255,255,255,0.35)",
                        }}
                      >
                        {num}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{
                      color: active
                        ? "white"
                        : done
                          ? "rgba(255,255,255,0.75)"
                          : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative z-10 p-8 pt-4">
          <p
            className="text-xs italic"
            style={{ color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}
          >
            "You cannot manage what
            <br />
            you cannot measure."
          </p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden flex items-center gap-2 px-6 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#3D6B4F" }}
            >
              <Leaf size={12} color="white" />
            </div>
            <span className="text-sm font-bold" style={{ color: "#1C1C1C" }}>
              GlycoTrack
            </span>
          </div>
          <div className="flex-1 flex gap-1 justify-end">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full flex-1 max-w-[48px]"
                style={{ backgroundColor: step > i ? "#3D6B4F" : "#EDE8DF" }}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[500px]">
            {/* ── Step 1: Biodata ─────────────────────── */}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <h2
                    className="font-bold mb-1"
                    style={{ color: "#1C1C1C", fontSize: 22 }}
                  >
                    Tell us about yourself
                  </h2>
                  <p className="text-sm" style={{ color: "#6B6B6B" }}>
                    We'll use this to personalize your daily targets.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="text-sm font-medium block mb-1.5"
                        style={{ color: "#1C1C1C" }}
                      >
                        Age
                      </label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="25"
                        min={10}
                        max={100}
                        className={inputBase}
                        style={inputStyle}
                        onFocus={focusGreen}
                        onBlur={blurNeutral}
                      />
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium block mb-1.5"
                        style={{ color: "#1C1C1C" }}
                      >
                        Sex
                      </label>
                      <div className="flex gap-2 h-[42px]">
                        {(["Male", "Female"] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => setSex(s)}
                            className="flex-1 rounded-lg text-sm font-medium border transition-all"
                            style={{
                              borderColor: sex === s ? "#3D6B4F" : "#EDE8DF",
                              backgroundColor: sex === s ? "#E8F5EC" : "white",
                              color: sex === s ? "#3D6B4F" : "#6B6B6B",
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="text-sm font-medium block mb-1.5"
                        style={{ color: "#1C1C1C" }}
                      >
                        Height
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="165"
                          className={inputBase + " pr-8"}
                          style={inputStyle}
                          onFocus={focusGreen}
                          onBlur={blurNeutral}
                        />
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                          style={{ color: "#6B6B6B" }}
                        >
                          cm
                        </span>
                      </div>
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium block mb-1.5"
                        style={{ color: "#1C1C1C" }}
                      >
                        Weight
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="65"
                          className={inputBase + " pr-7"}
                          style={inputStyle}
                          onFocus={focusGreen}
                          onBlur={blurNeutral}
                        />
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                          style={{ color: "#6B6B6B" }}
                        >
                          kg
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className="text-sm font-medium block mb-2"
                      style={{ color: "#1C1C1C" }}
                    >
                      Activity Level
                    </label>
                    <div className="flex flex-col gap-2">
                      {ACTIVITY_LEVELS.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setActivity(a.id)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                          style={{
                            border:
                              activity === a.id
                                ? "2px solid #3D6B4F"
                                : "1px solid #EDE8DF",
                            backgroundColor:
                              activity === a.id ? "#E8F5EC" : "white",
                          }}
                        >
                          <span className="text-xl shrink-0">{a.emoji}</span>
                          <div className="flex-1">
                            <div
                              className="text-sm font-semibold"
                              style={{ color: "#1C1C1C" }}
                            >
                              {a.label}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "#6B6B6B" }}
                            >
                              {a.desc}
                            </div>
                          </div>
                          {activity === a.id && (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: "#3D6B4F" }}
                            >
                              <Check
                                size={11}
                                color="white"
                                strokeWidth={2.5}
                              />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Health Status ────────────────── */}
            {step === 2 && (
              <div>
                <div className="mb-6">
                  <h2
                    className="font-bold mb-1"
                    style={{ color: "#1C1C1C", fontSize: 22 }}
                  >
                    Your health status
                  </h2>
                  <p className="text-sm" style={{ color: "#6B6B6B" }}>
                    This determines your GL targets and dietary badge.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {HEALTH_CONDITIONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCondition(c.id)}
                      className="flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all"
                      style={{
                        border:
                          condition === c.id
                            ? `2px solid ${c.accentColor}`
                            : "1px solid #EDE8DF",
                        backgroundColor: condition === c.id ? c.bg : "white",
                      }}
                    >
                      <div className="flex-1">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "#1C1C1C" }}
                        >
                          {c.label}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#6B6B6B" }}
                        >
                          {c.desc}
                        </div>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                        style={{
                          backgroundColor:
                            condition === c.id ? c.accentColor : "transparent",
                          border: `2px solid ${condition === c.id ? c.accentColor : "#D5D0C8"}`,
                        }}
                      >
                        {condition === c.id && (
                          <Check size={11} color="white" strokeWidth={2.5} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3: Targets ──────────────────────── */}
            {step === 3 && targets && (
              <div>
                <div className="mb-6">
                  <h2
                    className="font-bold mb-1"
                    style={{ color: "#1C1C1C", fontSize: 22 }}
                  >
                    Your personalized targets
                  </h2>
                  <p className="text-sm" style={{ color: "#6B6B6B" }}>
                    Based on your profile — you can adjust these later in
                    Settings.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {[
                    sex,
                    `${age} yrs`,
                    `${height} cm`,
                    `${weight} kg`,
                    activity,
                    condition,
                  ].map((v) => (
                    <span
                      key={v}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: "#EDE8DF", color: "#1C1C1C" }}
                    >
                      {v}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  {[
                    {
                      label: "Daily GL Target",
                      value: targets.gl,
                      unit: "GL",
                      emoji: "🩸",
                      desc: "Max glycemic load per day",
                      color: "#3D6B4F",
                    },
                    {
                      label: "Daily Calorie Target",
                      value: targets.calories,
                      unit: "kcal",
                      emoji: "🔥",
                      desc: "Total energy intake per day",
                      color: "#D4923A",
                    },
                    {
                      label: "Daily Protein Target",
                      value: targets.protein,
                      unit: "g",
                      emoji: "🥩",
                      desc: "Protein intake per day",
                      color: "#C4673A",
                    },
                  ].map(({ label, value, unit, emoji, desc, color }) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 px-5 py-4 rounded-xl"
                      style={{
                        backgroundColor: "white",
                        border: "1px solid #EDE8DF",
                      }}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <div className="flex-1">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "#1C1C1C" }}
                        >
                          {label}
                        </div>
                        <div className="text-xs" style={{ color: "#6B6B6B" }}>
                          {desc}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className="font-bold"
                          style={{
                            color,
                            fontVariantNumeric: "tabular-nums",
                            fontSize: 18,
                          }}
                        >
                          {value}
                        </span>
                        <span
                          className="text-xs ml-1"
                          style={{ color: "#6B6B6B" }}
                        >
                          {unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: "#F5F2ED",
                    border: "1px solid #EDE8DF",
                  }}
                >
                  <p className="text-xs" style={{ color: "#6B6B6B" }}>
                    These targets are calculated using the Mifflin-St Jeor
                    equation and adjusted for your health status. You can always
                    edit them in{" "}
                    <strong style={{ color: "#1C1C1C" }}>
                      Settings → Goals
                    </strong>
                    .
                  </p>
                </div>

                {submitError && (
                  <div
                    className="mt-3 p-3 rounded-lg text-sm"
                    style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                  >
                    {submitError}
                  </div>
                )}
              </div>
            )}

            {/* ── Navigation buttons ───────────────────── */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
                  style={{ borderColor: "#EDE8DF", color: "#6B6B6B" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "#EDE8DF")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "transparent")
                  }
                >
                  <ChevronLeft size={15} /> Back
                </button>
              )}
              {step < 3 && (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step === 1 ? !canNext1 : !canNext2}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{
                    backgroundColor: (step === 1 ? canNext1 : canNext2)
                      ? "#3D6B4F"
                      : "#C8C3BC",
                    cursor: (step === 1 ? canNext1 : canNext2)
                      ? "pointer"
                      : "not-allowed",
                  }}
                >
                  Continue <ChevronRight size={15} />
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #3D6B4F, #2D5540)",
                  }}
                >
                  {isSubmitting ? "Saving..." : "Start tracking →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
