import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Leaf, LayoutDashboard, PlusCircle, BarChart2, Settings, Flame, LogOut, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/diary", label: "Food Diary", icon: BookOpen },
  { path: "/log", label: "Log Food", icon: PlusCircle },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const w = collapsed ? 64 : 220;

  const [displayName, setDisplayName] = useState("Loading...");
  const [glTarget, setGlTarget] = useState<number>(100);

  const API = "https://localhost:7214";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const res = await fetch(`${API}/api/user-profile/${user.id}`);
        if (res.ok) {
          const profile = await res.json();
          setDisplayName(profile.displayName || "User");
          setGlTarget(profile.dailyGlTarget || 100);
        } else {
          const localName = localStorage.getItem("glycotrack_display_name");
          if (localName) setDisplayName(localName);
        }
      } catch (err) {
        console.error("Failed to fetch profile in sidebar:", err);
      }
    };

    // Fetch immediately on load
    fetchProfile();

    // Listen for updates from the Settings page
    window.addEventListener("glycotrack_update", fetchProfile);

    // Cleanup listener
    return () => window.removeEventListener("glycotrack_update", fetchProfile);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("glycotrack_display_name");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name: string) => {
    if (!name || name === "Loading...") return "--";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(displayName);

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col z-40 transition-all duration-300 overflow-hidden"
      style={{
        width: w,
        background: "linear-gradient(180deg, #1A3829 0%, #243F30 50%, #1A3829 100%)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="absolute top-[-60px] left-[-40px] w-[200px] h-[200px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(106,158,114,0.25) 0%, transparent 70%)" }}
      />

      <div
        className={`relative z-10 flex items-center h-16 px-4 shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
            >
              <Leaf size={14} color="white" />
            </div>
            <span className="font-bold text-sm truncate text-white">GlycoTrack</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Leaf size={14} color="white" />
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-colors shrink-0"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.1)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="relative z-10 px-2 pt-4 mb-3 shrink-0">
        {!collapsed ? (
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: "rgba(212,146,58,0.2)", color: "#F5C46A", border: "1px solid rgba(212,146,58,0.3)" }}
          >
            <Flame size={12} />
            <span className="truncate">7-day streak!</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,146,58,0.2)", border: "1px solid rgba(212,146,58,0.3)" }}
            >
              <Flame size={15} style={{ color: "#F5C46A" }} />
            </div>
          </div>
        )}
      </div>

      <nav className="relative z-10 flex-1 px-2 flex flex-col gap-1 overflow-hidden">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className="flex items-center rounded-xl transition-all duration-150"
              style={{
                gap: collapsed ? 0 : 10,
                padding: collapsed ? "10px 0" : "10px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                backgroundColor: active ? "rgba(255,255,255,0.15)" : "transparent",
                color: active ? "white" : "rgba(255,255,255,0.55)",
                fontWeight: active ? 600 : 400,
                border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
                backdropFilter: active ? "blur(8px)" : "none",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              <Icon size={17} />
              {!collapsed && <span className="text-sm truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className="relative z-10 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        {!collapsed ? (
          <div className="p-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate text-white">{displayName}</div>
                <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{glTarget} GL target</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
              title={displayName}
            >
              {initials}
            </div>
            <button
              onClick={handleSignOut}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              style={{ color: "rgba(255,255,255,0.4)" }}
              title="Sign out"
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}