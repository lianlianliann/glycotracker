import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { LogFood } from "./pages/LogFood";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { Diary } from "./pages/Diary";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "onboarding", Component: Onboarding },
      { path: "dashboard", Component: Dashboard },
      { path: "log", Component: LogFood },
      { path: "analytics", Component: Analytics },
      { path: "settings", Component: Settings },
      { path: "diary", Component: Diary },
    ],
  },
]);
