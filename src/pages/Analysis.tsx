import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { UploadCloud, Trash2, Database } from "lucide-react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, CartesianGridProps } from "recharts";
import { PageHeader } from "@/components/shell/AppLayout";
import { Card, Button, Field, Select, EmptyState, Badge } from "@/components/ui";
import { useApp } from "@/store/app";
import { fileContentToDataset } from "@/lib/parse";
import { cn, shortDate, relativeTime } from "@/lib/utils";

type ChartKind = "area" | "line" | "bar";

function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { name?: string; value?: number | string; color?: string }[]; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-elevated px-3.5 py-2.5 shadow-xl shadow-black/50">
      <p className="text-[11.5px] text-ink-muted">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="mt-1 text-[12px] font-medium" style={{ color: p.color }}>
          {p.name}: <span className="tabular-nums">{String(p.value)}</span> {unit}
        </p>
      ))}
    </div>
  );
}

export default function AnalysisPage() {
  const [params] = useSearchParams();
  const { datasets, addDataset, removeDataset, pushToast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [activeId, setActiveId] = useState(() => datasets[0]?.id ?? "");
  const [seriesName, setSeriesName] = useState("");
  const [chartKind, setChartKind] = useState<ChartKind>("area");

  useEffect(() => {
    if (params.get("upload") === "1") fileRef.current?.click();
  }, [params]);

  useEffect(() => {
    if (!datasets.find((d) => d.id === activeId)) setActiveId(datasets[0]?.id ?? "");
  }, [datasets, activeId]);

  const active = datasets.find((d) => d.id === activeId) ?? datasets[0];
  const series = active?.series ?? [];
  const activeSeries = series.find((s) => s.name === seriesName) ?? series[0];

  useEffect(() => {
    if (activeSeries && activeSeries.name !== seriesName) setSeriesName(activeSeries.name);
  }, [activeSeries, seriesName]);

  const chartData = useMemo(
    () =>
      (activeSeries?.points ?? []).map((p) => ({
        name: p.label,
        value: p.value,
      })),
    [activeSeries],
  );

  const stats = useMemo(() => {
    const vals = chartData.map((d) => Number(d.value)).filter((v) => Number.isFinite(v));
    if (!vals.length) return null;
    const sum = vals.reduce((a, b) => a + b, 0);
    return {
      min: Math.min(...vals),
      max: Math.max(...vals),
      avg: sum / vals.length,
      count: vals.length,
    };
  }, [chartData]);

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const dataset = fileContentToDataset(file.name, text);
      addDataset(dataset);
      setActiveId(dataset.id);
      pushToast(`“${file.name}” parsed — ${dataset.series.length} series`, "success");
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Could not parse that file", "info");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const gridProps: CartesianGridProps = { stroke: "#1a2540", strokeDasharray: "3 6", vertical: false };

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="Data & Analysis"
        subtitle="Upload a CSV or JSON file from your device — parsing happens locally in the browser and nothing is sent anywhere."
        actions={
          <Button variant="gradient" onClick={() => fileRef.current?.click()}>
            <UploadCloud className="size-4" /> Upload dataset
          </Button>
        }
      />
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.tsv,.json,text/csv,application/json"
        className="hidden"
        onChange={(e) => onUpload(e.target.files?.[0])}
      />

      {datasets.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No datasets yet"
          description="Upload a CSV with a label column plus one or more numeric columns (or a JSON array of objects) to build your first chart."
          action={
            <Button variant="gradient" onClick={() => fileRef.current?.click()}>
              <UploadCloud className="size-4" /> Upload your first dataset
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-12">
          <Card className="lg:col-span-4">
            <h2 className="border-b border-line px-5 py-4 text-[15px] font-semibold text-ink">Datasets</h2>
            <ul className="space-y-2 p-3">
              {datasets.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => setActiveId(d.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                      d.id === active?.id ? "border-blue/45 bg-blue/10" : "border-line bg-panel/50 hover:border-blue-soft/30",
                    )}
                  >
                    <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg", d.id === active?.id ? "bg-blue/20 text-blue-soft" : "bg-white/5 text-ink-muted")}>
                      <Database className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">{d.name}</span>
                      <span className="mt-0.5 block text-[11.5px] text-ink-muted">
                        {d.series.length} series · {relativeTime(d.uploadedAt)}
                      </span>
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Delete ${d.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDataset(d.id);
                        pushToast(`Removed “${d.name}”`, "info");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          removeDataset(d.id);
                        }
                      }}
                      className="grid size-7 shrink-0 place-items-center rounded-lg text-ink-muted transition hover:bg-rose/12 hover:text-rose"
                    >
                      <Trash2 className="size-3.5" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="border-t border-line px-5 py-3 text-[11.5px] leading-relaxed text-ink-muted">
              Accepted: <span className="text-ink-soft">.csv</span>, <span className="text-ink-soft">.tsv</span>,{" "}
              <span className="text-ink-soft">.json</span> · processed on-device only
            </p>
          </Card>

          <Card className="lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-[15px] font-semibold text-ink">{active?.name ?? "Chart"}</h2>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {active ? `Uploaded ${shortDate(active.uploadedAt)}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Select
                  value={activeSeries?.name ?? ""}
                  onChange={(e) => setSeriesName(e.target.value)}
                  aria-label="Series"
                  className="h-9 w-48 text-[12.5px]"
                >
                  {series.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <div className="inline-flex rounded-xl border border-line bg-panel/70 p-1">
                  {(["area", "line", "bar"] as ChartKind[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => setChartKind(k)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-[12px] font-medium capitalize transition-colors",
                        chartKind === k ? "bg-blue/80 text-white" : "text-ink-muted hover:text-ink-soft",
                      )}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[300px] px-3 py-4">
              <ResponsiveContainer width="100%" height="100%">
                {chartKind === "bar" ? (
                  <BarChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="name" tick={{ fill: "#6d7b93", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6d7b93", fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<ChartTooltip unit={activeSeries?.unit} />} cursor={{ fill: "rgba(96,165,250,0.07)" }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} animationDuration={800} />
                  </BarChart>
                ) : chartKind === "line" ? (
                  <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="name" tick={{ fill: "#6d7b93", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6d7b93", fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<ChartTooltip unit={activeSeries?.unit} />} />
                    <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2.4} dot={{ r: 3, fill: "#60a5fa" }} animationDuration={900} />
                  </LineChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="name" tick={{ fill: "#6d7b93", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6d7b93", fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<ChartTooltip unit={activeSeries?.unit} />} />
                    <Area type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2.4} fill="url(#areaFill)" animationDuration={900} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {stats && (
              <dl className="grid gap-3 border-t border-line px-5 py-4 sm:grid-cols-4">
                <div>
                  <dt className="text-[11.5px] text-ink-muted">Points</dt>
                  <dd className="text-[14px] font-semibold tabular-nums text-ink">{stats.count}</dd>
                </div>
                <div>
                  <dt className="text-[11.5px] text-ink-muted">Min</dt>
                  <dd className="text-[14px] font-semibold tabular-nums text-ink">{stats.min}</dd>
                </div>
                <div>
                  <dt className="text-[11.5px] text-ink-muted">Max</dt>
                  <dd className="text-[14px] font-semibold tabular-nums text-ink">{stats.max}</dd>
                </div>
                <div>
                  <dt className="text-[11.5px] text-ink-muted">Average</dt>
                  <dd className="text-[14px] font-semibold tabular-nums text-blue-soft">{stats.avg.toFixed(2)}</dd>
                </div>
              </dl>
            )}
            <p className="border-t border-line px-5 py-3 text-[11px] text-ink-muted">
              Example CSV header: <Badge tone="neutral" className="ml-1">cycle,value_a,value_b</Badge>
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
