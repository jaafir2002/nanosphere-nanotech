import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/shell/AppLayout";
import AuthPage from "@/pages/Auth";
import DashboardPage from "@/pages/Dashboard";
import ExplorePage from "@/pages/Explore";
import MaterialDetailPage from "@/pages/MaterialDetail";
import SimulationPage from "@/pages/Simulation";
import LabToolsPage from "@/pages/LabTools";
import AnalysisPage from "@/pages/Analysis";
import ProjectsPage from "@/pages/Projects";
import ResourcesPage from "@/pages/Resources";
import { ResearchIndexPage, ResearchArticlePage } from "@/pages/Research";
import SettingsPage from "@/pages/Settings";
import NotFoundPage from "@/pages/NotFound";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export const router = createBrowserRouter(
  [
  {
    path: "/login",
    element: <AuthPage mode="login" />,
  },
  {
    path: "/signup",
    element: <AuthPage mode="signup" />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "explore", element: <ExplorePage /> },
      { path: "materials/:id", element: <MaterialDetailPage /> },
      { path: "simulation", element: <SimulationPage /> },
      { path: "lab-tools", element: <LabToolsPage /> },
      { path: "analysis", element: <AnalysisPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "resources", element: <ResourcesPage /> },
      { path: "research", element: <ResearchIndexPage /> },
      { path: "research/:id", element: <ResearchArticlePage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  ],
  { basename },
);
