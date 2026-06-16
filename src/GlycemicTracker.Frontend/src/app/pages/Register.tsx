import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export function Register() {
  const [showPass, setShowPass] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
        // Optional: Add this to redirect them directly to onboarding after clicking the email link
        emailRedirectTo: `${window.location.origin}/onboarding`
      },
    });

    setIsLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (!data.user) {
      setError("Unable to create account. Please try again.");
      return;
    }

    // If session is null, email confirmation is required
    if (!data.session) {
      setError("Account created! Please check your email for the verification link before continuing.");
      localStorage.setItem("glycotrack_display_name", displayName);
      localStorage.setItem("glycotrack_pending_onboarding", "true");
      return; 
    }

    // If email confirmation is off, navigate immediately
    localStorage.setItem("glycotrack_display_name", displayName);
    localStorage.setItem("glycotrack_pending_onboarding", "true");
    navigate("/onboarding");
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors";
  const inputStyle = { borderColor: "#EDE8DF", backgroundColor: "white" };
  const focusGreen = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => (e.target.style.borderColor = "#3D6B4F");
  const blurNeutral = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => (e.target.style.borderColor = "#EDE8DF");

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#FAF7F2" }}
    >
      <div
        className="w-full max-w-[440px] bg-white rounded-xl p-8"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#3D6B4F" }}
          >
            <UserPlus size={20} color="white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "#1C1C1C" }}>
            Create account
          </h1>
          <p className="text-sm mt-1 text-center" style={{ color: "#6B6B6B" }}>
            Start optimizing your glycemic load today
          </p>
        </div>

        {/* Google */}
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium mb-4 transition-colors hover:bg-gray-50"
          style={{ borderColor: "#EDE8DF", color: "#1C1C1C" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path
              fill="#4285F4"
              d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.68 3.68 0 0 1-1.6 2.42v2h2.58c1.52-1.4 2.4-3.46 2.4-5.88z"
            />
            <path
              fill="#34A853"
              d="M8 16c2.16 0 3.97-.71 5.3-1.93l-2.58-2a4.77 4.77 0 0 1-7.1-2.5H.96v2.07A8 8 0 0 0 8 16z"
            />
            <path
              fill="#FBBC05"
              d="M3.62 9.57A4.8 4.8 0 0 1 3.37 8c0-.55.1-1.08.25-1.57V4.36H.96A8 8 0 0 0 0 8c0 1.29.31 2.51.96 3.64l2.66-2.07z"
            />
            <path
              fill="#EA4335"
              d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.38-2.38A7.97 7.97 0 0 0 8 0 8 8 0 0 0 .96 4.36l2.66 2.07C4.37 4.46 6.01 3.18 8 3.18z"
            />
          </svg>
          Sign up with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ backgroundColor: "#EDE8DF" }} />
          <span className="text-xs" style={{ color: "#6B6B6B" }}>
            or fill in your details
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#EDE8DF" }} />
        </div>

        {error && (
          <div
            className="mb-3 p-3 rounded-lg text-sm"
            style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Display name */}
          <div>
            <label
              className="text-sm font-medium block mb-1.5"
              style={{ color: "#1C1C1C" }}
            >
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Juan dela Cruz"
              className={inputClass}
              style={inputStyle}
              onFocus={focusGreen}
              onBlur={blurNeutral}
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div>
            <label
              className="text-sm font-medium block mb-1.5"
              style={{ color: "#1C1C1C" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className={inputClass}
              style={inputStyle}
              onFocus={focusGreen}
              onBlur={blurNeutral}
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="text-sm font-medium block mb-1.5"
              style={{ color: "#1C1C1C" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className={inputClass + " pr-10"}
                style={inputStyle}
                onFocus={focusGreen}
                onBlur={blurNeutral}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#6B6B6B" }}
                disabled={isLoading}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs" style={{ color: "#6B6B6B" }}>
            By signing up, you agree to our{" "}
            <a href="#" className="underline" style={{ color: "#3D6B4F" }}>
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline" style={{ color: "#3D6B4F" }}>
              Privacy Policy
            </a>
          </p>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#3D6B4F" }}
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: "#6B6B6B" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium"
            style={{ color: "#3D6B4F" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}