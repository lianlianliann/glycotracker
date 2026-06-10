import { useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

const APP_PATHS = ["/dashboard", "/log", "/analytics", "/settings", "/diary"];

function isAppPath(pathname: string) {
  return APP_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));
}

export function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const { pathname } = location;

  // Redirect to onboarding if a new account registration is pending
  if (isAppPath(pathname) && localStorage.getItem("glycotrack_pending_onboarding") === "true") {
    return <Navigate to="/onboarding" replace />;
  }

  // Onboarding gets a fully clean canvas — no nav, no sidebar
  if (pathname === "/onboarding") {
    return <Outlet />;
  }

  if (isAppPath(pathname)) {
    const sidebarW = collapsed ? 64 : 220;
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: "#FAF7F2" }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <main
          className="flex-1 min-h-screen overflow-y-auto transition-all duration-300"
          style={{ marginLeft: sidebarW, backgroundColor: "#FAF7F2" }}
        >
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF7F2" }}>
      <Navbar />
      <Outlet />
    </div>
  );
}
