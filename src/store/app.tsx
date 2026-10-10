import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  SEED_ACTIVITIES,
  SEED_DATASETS,
  SEED_NOTIFICATIONS,
  SEED_PROJECTS,
  type Activity,
  type ActivityKind,
  type AppNotification,
  type Dataset,
  type Project,
  type ProjectStatus,
  type ProjectTask,
} from "@/data/seeds";
import type { ChartMetricKey } from "@/data/materials";
import { clearAllLS, readLS, removeLS, writeLS } from "@/lib/storage";
import { uid } from "@/lib/utils";

export interface Settings {
  name: string;
  email: string;
  role: string;
  density: "comfortable" | "compact";
  defaultMetric: ChartMetricKey;
  emailDigest: boolean;
}

export interface AuthUser {
  name: string;
  email: string;
  guest: boolean;
}

interface Account {
  name: string;
  email: string;
  password: string;
}

export interface Toast {
  id: string;
  message: string;
  tone: "default" | "success" | "info";
}

interface AppState {
  user: AuthUser | null;
  activities: Activity[];
  notifications: AppNotification[];
  datasets: Dataset[];
  projects: Project[];
  saved: string[];
  searchHistory: string[];
  settings: Settings;
  toasts: Toast[];
  login: (email: string, password: string) => string | null;
  signup: (input: { name: string; email: string; password: string }) => string | null;
  continueAsGuest: () => void;
  logout: () => void;
  logActivity: (kind: ActivityKind, title: string, meta?: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  addDataset: (dataset: Dataset) => void;
  removeDataset: (id: string) => void;
  createProject: (input: { name: string; description: string; status: ProjectStatus }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  addTask: (projectId: string, title: string) => void;
  toggleSaved: (materialId: string) => void;
  pushSearch: (term: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  pushToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;
  resetWorkspace: () => void;
}

const AppContext = createContext<AppState | null>(null);

const DEFAULT_SETTINGS: Settings = {
  name: "Researcher",
  email: "researcher@nanosphere.io",
  role: "Principal Researcher",
  density: "comfortable",
  defaultMetric: "electrical",
  emailDigest: true,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readLS("user", null as AuthUser | null));
  const [accounts, setAccounts] = useState<Account[]>(() => readLS("accounts", [] as Account[]));
  const [activities, setActivities] = useState<Activity[]>(() => readLS("activities", SEED_ACTIVITIES));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => readLS("notifications", SEED_NOTIFICATIONS));
  const [datasets, setDatasets] = useState<Dataset[]>(() => readLS("datasets", SEED_DATASETS));
  const [projects, setProjects] = useState<Project[]>(() => readLS("projects", SEED_PROJECTS));
  const [saved, setSaved] = useState<string[]>(() => readLS("saved", ["graphene"] as string[]));
  const [searchHistory, setSearchHistory] = useState<string[]>(() => readLS("searchHistory", ["Carbon Nanotube"] as string[]));
  const [settings, setSettings] = useState<Settings>(() => ({ ...DEFAULT_SETTINGS, ...readLS("settings", {} as Partial<Settings>) }));
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => writeLS("user", user), [user]);
  useEffect(() => writeLS("accounts", accounts), [accounts]);
  useEffect(() => writeLS("activities", activities), [activities]);
  useEffect(() => writeLS("notifications", notifications), [notifications]);
  useEffect(() => writeLS("datasets", datasets), [datasets]);
  useEffect(() => writeLS("projects", projects), [projects]);
  useEffect(() => writeLS("saved", saved), [saved]);
  useEffect(() => writeLS("searchHistory", searchHistory), [searchHistory]);
  useEffect(() => writeLS("settings", settings), [settings]);

  const pushToast = useCallback((message: string, tone: Toast["tone"] = "default") => {
    const id = uid("toast");
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const login = useCallback(
    (email: string, password: string): string | null => {
      const e = email.trim().toLowerCase();
      if (!e || !password) return "Email and password are required.";
      const acct = accounts.find((a) => a.email === e);
      if (!acct) return "No account found for that email. Create one first.";
      if (acct.password !== password) return "Incorrect password. Try again.";
      const u: AuthUser = { name: acct.name, email: acct.email, guest: false };
      setUser(u);
      setSettings((prev) => ({ ...prev, name: u.name, email: u.email }));
      return null;
    },
    [accounts],
  );

  const signup = useCallback(
    (input: { name: string; email: string; password: string }): string | null => {
      const name = input.name.trim();
      const email = input.email.trim().toLowerCase();
      if (!name) return "Name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
      if (input.password.length < 6) return "Password must be at least 6 characters.";
      if (accounts.some((a) => a.email === email)) return "An account with this email already exists — sign in instead.";
      const acct: Account = { name, email, password: input.password };
      setAccounts((prev) => [...prev, acct]);
      const u: AuthUser = { name, email, guest: false };
      setUser(u);
      setSettings((prev) => ({ ...prev, name: u.name, email: u.email }));
      return null;
    },
    [accounts],
  );

  const continueAsGuest = useCallback(() => {
    const u: AuthUser = { name: "Guest", email: "guest@nanosphere.local", guest: true };
    setUser(u);
    setSettings((prev) => ({ ...prev, name: u.name, email: u.email }));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const logActivity = useCallback((kind: ActivityKind, title: string, meta?: string) => {
    setActivities((prev) => [{ id: uid("act"), kind, title, meta, at: new Date().toISOString() }, ...prev].slice(0, 40));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const addDataset = useCallback(
    (dataset: Dataset) => {
      setDatasets((prev) => [dataset, ...prev]);
      logActivity("dataset", "New dataset uploaded", dataset.name);
    },
    [logActivity],
  );

  const removeDataset = useCallback((id: string) => {
    setDatasets((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const createProject = useCallback(
    (input: { name: string; description: string; status: ProjectStatus }) => {
      const project: Project = {
        id: uid("proj"),
        name: input.name,
        description: input.description,
        status: input.status,
        createdAt: new Date().toISOString(),
        tasks: [],
      };
      setProjects((prev) => [project, ...prev]);
      logActivity("project", `Project "${input.name}" created`, `Status: ${input.status}`);
      return project;
    },
    [logActivity],
  );

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleTask = useCallback((projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, tasks: p.tasks.map((t: ProjectTask) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
          : p,
      ),
    );
  }, []);

  const addTask = useCallback((projectId: string, title: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, tasks: [...p.tasks, { id: uid("task"), title, done: false }] } : p)),
    );
  }, []);

  const toggleSaved = useCallback((materialId: string) => {
    setSaved((prev) => (prev.includes(materialId) ? prev.filter((s) => s !== materialId) : [...prev, materialId]));
  }, []);

  const pushSearch = useCallback(
    (term: string) => {
      const clean = term.trim();
      if (!clean) return;
      setSearchHistory((prev) => [clean, ...prev.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 8));
      logActivity("search", `You searched for "${clean}"`, "Explore Nanomaterials");
    },
    [logActivity],
  );

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    if (patch.name !== undefined || patch.email !== undefined) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: (patch.name ?? prev.name).trim() || prev.name,
              email: (patch.email ?? prev.email).trim() || prev.email,
            }
          : prev,
      );
    }
  }, []);

  const resetWorkspace = useCallback(() => {
    clearAllLS();
    setActivities(SEED_ACTIVITIES);
    setNotifications(SEED_NOTIFICATIONS);
    setDatasets(SEED_DATASETS);
    setProjects(SEED_PROJECTS);
    setSaved(["graphene"]);
    setSearchHistory(["Carbon Nanotube"]);
    setSettings(user ? { ...DEFAULT_SETTINGS, name: user.name, email: user.email } : DEFAULT_SETTINGS);
    writeLS("user", user);
    writeLS("accounts", accounts);
    pushToast("Demo workspace reset to defaults", "info");
  }, [pushToast, user, accounts]);

  const value = useMemo<AppState>(
    () => ({
      user,
      activities,
      notifications,
      datasets,
      projects,
      saved,
      searchHistory,
      settings,
      toasts,
      login,
      signup,
      continueAsGuest,
      logout,
      logActivity,
      markAllRead,
      clearNotifications,
      addDataset,
      removeDataset,
      createProject,
      updateProject,
      deleteProject,
      toggleTask,
      addTask,
      toggleSaved,
      pushSearch,
      updateSettings,
      pushToast,
      dismissToast,
      resetWorkspace,
    }),
    [
      user,
      activities,
      notifications,
      datasets,
      projects,
      saved,
      searchHistory,
      settings,
      toasts,
      login,
      signup,
      continueAsGuest,
      logout,
      logActivity,
      markAllRead,
      clearNotifications,
      addDataset,
      removeDataset,
      createProject,
      updateProject,
      deleteProject,
      toggleTask,
      addTask,
      toggleSaved,
      pushSearch,
      updateSettings,
      pushToast,
      dismissToast,
      resetWorkspace,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export { DEFAULT_SETTINGS, removeLS };
