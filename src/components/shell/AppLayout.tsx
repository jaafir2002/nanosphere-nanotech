import { useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar, MobileDrawer } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { Footer } from "@/components/shell/Footer";
import { Toaster } from "@/components/ui";
import { useApp } from "@/store/app";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { settings, user } = useApp();
  const compact = settings.density === "compact";

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-void">
      <Sidebar />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <Topbar onOpenMenu={() => setMobileOpen(true)} />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={compact ? "px-4 py-4 sm:px-6 lg:px-8" : "px-4 py-6 sm:px-6 lg:px-8"}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>

      <Toaster />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const staggerChild = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};
