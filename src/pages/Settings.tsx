import { useState, type ReactNode } from "react";
import { Download, RefreshCw, User, Sliders, Database, Info } from "lucide-react";
import { PageHeader } from "@/components/shell/AppLayout";
import { Card, Button, Field, Input, Select, Modal, Badge, SegmentedControl } from "@/components/ui";
import { useApp } from "@/store/app";
import { downloadJson } from "@/lib/utils";
import { CHART_METRICS, type ChartMetricKey } from "@/data/materials";

function Section({ icon: Icon, title, description, children }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; children: ReactNode }) {
  return (
    <Card>
      <div className="flex items-start gap-3 border-b border-line px-5 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue/12 text-blue-soft">
          <Icon className="size-4.5" />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          <p className="mt-0.5 text-[12px] text-ink-muted">{description}</p>
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </Card>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={checked ? "relative h-6 w-11 shrink-0 rounded-full bg-blue transition-colors" : "relative h-6 w-11 shrink-0 rounded-full bg-panel transition-colors"}
    >
      <span className={checked ? "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform translate-x-5" : "absolute left-0.5 top-0.5 size-5 rounded-full bg-ink-muted shadow transition-transform"} />
    </button>
  );
}

export default function SettingsPage() {
  const { settings, user, updateSettings, pushToast, resetWorkspace, projects, datasets, saved, activities } = useApp();
  const [name, setName] = useState(settings.name);
  const [email, setEmail] = useState(settings.email);
  const [role, setRole] = useState(settings.role);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        title="Settings"
        subtitle="Profile, workspace preferences and local data controls. Nothing here leaves your browser."
      />

      <div className="space-y-5">
        <Section icon={User} title="Profile" description="Used for the welcome message and avatar label.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Role">
              <Input value={role} onChange={(e) => setRole(e.target.value)} />
            </Field>
          </div>
          <Button
            variant="gradient"
            className="mt-4"
            onClick={() => {
              updateSettings({ name: name.trim() || "Researcher", email: email.trim(), role: role.trim() });
              pushToast("Profile saved", "success");
            }}
          >
            Save changes
          </Button>
        </Section>

        <Section icon={Sliders} title="Preferences" description="Tune how the workspace behaves.">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-ink">Interface density</p>
                <p className="text-[12px] text-ink-muted">Compact tightens page padding across all routes.</p>
              </div>
              <SegmentedControl
                options={[
                  { value: "comfortable", label: "Comfortable" },
                  { value: "compact", label: "Compact" },
                ]}
                value={settings.density}
                onChange={(v) => updateSettings({ density: v })}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div>
                <p className="text-[13px] font-medium text-ink">Default comparison metric</p>
                <p className="text-[12px] text-ink-muted">Preselects a metric on the dashboard chart.</p>
              </div>
              <Select
                value={settings.defaultMetric}
                onChange={(e) => updateSettings({ defaultMetric: e.target.value as ChartMetricKey })}
                className="w-56"
                aria-label="Default chart metric"
              >
                {CHART_METRICS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div>
                <p className="text-[13px] font-medium text-ink">Weekly research digest</p>
                <p className="text-[12px] text-ink-muted">Demo preference — no email is ever sent.</p>
              </div>
              <Toggle checked={settings.emailDigest} onChange={(v) => updateSettings({ emailDigest: v })} label="Weekly research digest" />
            </div>
          </div>
        </Section>

        <Section icon={Database} title="Local data" description={`${projects.length} projects · ${datasets.length} datasets · ${saved.length} saved materials · ${activities.length} activities`}>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                downloadJson("nanosphere-workspace.json", {
                  exportedAt: new Date().toISOString(),
                  settings,
                  projects,
                  datasets,
                  saved,
                  activities,
                });
                pushToast("Workspace exported as JSON", "success");
              }}
            >
              <Download className="size-4" /> Export workspace
            </Button>
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              <RefreshCw className="size-4" /> Reset demo data
            </Button>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-muted">
            Data lives under the <span className="font-mono text-ink-soft">nanosphere:</span> prefix in your browser’s local
            storage. Resetting restores the original sample projects, datasets and activity feed.
          </p>
        </Section>

        <Section icon={Info} title="About" description="Build information and demo notices.">
          <div className="space-y-2 text-[13px] text-ink-muted">
            <p>
              <Badge tone="blue" className="mr-2">
                NanoSphere
              </Badge>
              Version 1.0 · demo workspace
            </p>
            <p>
              Built with React, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts and React Three Fiber. All scientific
              values are sample data; simulations and calculators are illustrative models.
            </p>
          </div>
        </Section>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo workspace?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetWorkspace();
                setConfirmReset(false);
                setName(user?.name ?? "Researcher");
                setEmail(user?.email ?? "researcher@nanosphere.io");
                setRole("Principal Researcher");
              }}
            >
              Reset everything
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-ink-soft">
          All projects, datasets, saved materials, search history and settings stored in this browser will be replaced with
          the original sample workspace.
        </p>
      </Modal>
    </div>
  );
}
