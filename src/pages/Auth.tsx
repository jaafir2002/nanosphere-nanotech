import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Atom, Sparkles } from "lucide-react";
import { PromoMolecule } from "@/art";
import { Logo } from "@/components/shell/Sidebar";
import { Button, Field, Input, Toaster } from "@/components/ui";
import { useApp } from "@/store/app";

const DEMO = { name: "Demo Researcher", email: "demo@nanosphere.io", password: "demo1234" };

const FEATURES = [
  "Explore 12+ nanomaterials with property data",
  "Run demo simulations — Scherrer, diffusion, optics",
  "Upload CSV/JSON datasets and compare visually",
  "Track projects, saved materials and research notes",
];

export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const { user, login, signup, continueAsGuest, pushToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/" replace />;

  const finish = (msg: string) => {
    navigate(from, { replace: true });
    pushToast(msg, "success");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      const err = login(email, password);
      if (err) return setError(err);
      finish(`Welcome back!`);
    } else {
      const err = signup({ name, email, password });
      if (err) return setError(err);
      finish("Account created — welcome to NanoSphere!");
    }
  };

  const onDemo = () => {
    if (mode === "login") {
      const err = login(DEMO.email, DEMO.password);
      if (err) {
        const created = signup(DEMO);
        if (created) return setError(created);
      }
    } else {
      const err = signup(DEMO);
      if (err && !err.includes("already exists")) return setError(err);
      if (err?.includes("already exists")) {
        const loginErr = login(DEMO.email, DEMO.password);
        if (loginErr) return setError(loginErr);
      }
    }
    finish("Signed in with the demo account");
  };

  const onGuest = () => {
    continueAsGuest();
    finish("Continuing as guest — data stays on this device");
  };

  return (
    <div className="relative grid min-h-screen bg-void lg:grid-cols-2">
      <div className="pointer-events-none absolute -left-32 top-1/4 size-96 rounded-full bg-blue/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-[28rem] rounded-full bg-violet/12 blur-3xl" />

      <aside className="relative hidden flex-col justify-between border-r border-line bg-panel/50 p-10 lg:flex">
        <Logo />
        <div className="max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-bold leading-tight tracking-tight text-ink"
          >
            Smaller Scale.
            <br />
            <span className="grad-text">Bigger Impact.</span>
          </motion.h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            The NanoSphere workspace for exploring nanomaterials, running simulations and organising research — all in your
            browser.
          </p>
          <ul className="mt-8 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[13.5px] text-ink-soft">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-cyan/15 text-cyan">
                  <Sparkles className="size-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-end justify-between gap-6">
          <p className="text-[12px] leading-relaxed text-ink-muted">
            Demo product · scientific values are illustrative
            <br />
            sample data, not lab-grade results.
          </p>
          <PromoMolecule className="w-44 shrink-0 opacity-80" />
        </div>
      </aside>

      <main className="relative flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-2xl border border-line bg-elevated/80 p-8 shadow-2xl shadow-black/40 backdrop-blur"
        >
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <Logo compact />
          </div>

          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-blue to-violet text-white shadow-lg shadow-indigo-950/50">
              <Atom className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-[13px] text-ink-muted">
                {mode === "login" ? "Sign in to continue to NanoSphere" : "Join NanoSphere in a few seconds"}
              </p>
            </div>
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-xl border border-rose/30 bg-rose/10 px-3.5 py-2.5 text-[13px] text-rose">
              {error}
            </p>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <Field label="Full name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                  required
                />
              </Field>
            )}
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lab.io"
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </Field>

            <Button type="submit" variant="gradient" size="lg" className="w-full">
              {mode === "login" ? "Sign in" : "Create account"} <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11.5px] uppercase tracking-wider text-ink-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="space-y-2.5">
            <Button variant="secondary" size="lg" className="w-full" onClick={onDemo}>
              Try the demo account
            </Button>
            <Button variant="ghost" size="lg" className="w-full" onClick={onGuest}>
              Continue as guest
            </Button>
          </div>

          <p className="mt-6 text-center text-[13px] text-ink-muted">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <Link
              to={mode === "login" ? "/signup" : "/login"}
              className="font-medium text-blue-soft transition hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </Link>
          </p>

          <p className="mt-4 text-center text-[11.5px] leading-relaxed text-ink-muted/80">
            Demo only — accounts live in your browser&apos;s local storage and are never sent anywhere.
          </p>
        </motion.div>
      </main>

      <Toaster />
    </div>
  );
}
