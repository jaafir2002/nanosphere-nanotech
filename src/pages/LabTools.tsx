import { useState } from "react";
import { Calculator, Ruler, TestTube, Waves } from "lucide-react";
import { PageHeader } from "@/components/shell/AppLayout";
import { Card, Field, Input } from "@/components/ui";
import { scherrerDiameter, dilutionVolume, evToWavelength, wavelengthToEv, DEMO_DISCLAIMER } from "@/lib/science";
import { cn } from "@/lib/utils";

function ResultRow({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-panel/70 px-4 py-3">
      <span className="text-[12.5px] text-ink-muted">{label}</span>
      <span className="text-[15px] font-bold tabular-nums text-blue-soft">
        {value} <span className="text-[12px] font-medium text-ink-muted">{unit}</span>
      </span>
    </div>
  );
}

function ToolCard({
  icon: Icon,
  title,
  description,
  accent,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start gap-3 border-b border-line px-5 py-4">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", accent)}>
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">{description}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-5 py-4">{children}</div>
    </Card>
  );
}

export default function LabToolsPage() {
  const [fwhm, setFwhm] = useState("0.42");
  const [theta, setTheta] = useState("25");
  const [lambda, setLambda] = useState("0.154");

  const [c1, setC1] = useState("10");
  const [v1, setV1] = useState("100");
  const [c2, setC2] = useState("1");

  const [nm, setNm] = useState("450");

  const grain = scherrerDiameter({ fwhmDeg: Number(fwhm) || 0, thetaDeg: Number(theta) || 0, lambdaNm: Number(lambda) || 0 });
  const vol = dilutionVolume({ c1: Number(c1) || 0, v1: Number(v1) || 0, c2: Number(c2) || 0 });
  const ev = wavelengthToEv(Number(nm) || 0);

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="Lab Tools"
        subtitle="Instant utilities built on well-known equations. Real formulas, illustrative context — results update as you type."
        actions={<span className="text-[12px] text-ink-muted">{DEMO_DISCLAIMER}</span>}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <ToolCard
          icon={Ruler}
          title="Scherrer grain size"
          description="D = K·λ / (β·cos θ) from XRD peak broadening."
          accent="bg-blue/15 text-blue-soft"
        >
          <Field label="FWHM β (°)">
            <Input type="number" step="0.01" min="0.01" value={fwhm} onChange={(e) => setFwhm(e.target.value)} />
          </Field>
          <Field label="Bragg angle θ (°)">
            <Input type="number" step="0.5" min="1" value={theta} onChange={(e) => setTheta(e.target.value)} />
          </Field>
          <Field label="Wavelength λ (nm) — Cu Kα = 0.154">
            <Input type="number" step="0.001" min="0.001" value={lambda} onChange={(e) => setLambda(e.target.value)} />
          </Field>
          <ResultRow label="Crystallite diameter" value={grain > 0 && Number.isFinite(grain) ? grain.toFixed(2) : "—"} unit="nm" />
        </ToolCard>

        <ToolCard
          icon={TestTube}
          title="Dilution calculator"
          description="C₁·V₁ = C₂·V₂ stock volume required."
          accent="bg-mint/15 text-mint"
        >
          <Field label="Stock concentration C₁">
            <Input type="number" step="0.1" min="0" value={c1} onChange={(e) => setC1(e.target.value)} />
          </Field>
          <Field label="Final volume V₁ (mL)">
            <Input type="number" step="1" min="0" value={v1} onChange={(e) => setV1(e.target.value)} />
          </Field>
          <Field label="Desired concentration C₂">
            <Input type="number" step="0.1" min="0" value={c2} onChange={(e) => setC2(e.target.value)} />
          </Field>
          <ResultRow label="Stock needed" value={vol > 0 && Number.isFinite(vol) ? vol.toFixed(2) : "—"} unit="mL" />
          <p className="text-[11.5px] text-ink-muted">
            Solvent to add:{" "}
            <span className="font-semibold text-ink-soft">
              {vol > 0 && Number.isFinite(vol) && Number(v1) > vol ? (Number(v1) - vol).toFixed(2) : "—"} mL
            </span>
          </p>
        </ToolCard>

        <ToolCard
          icon={Waves}
          title="Photon energy converter"
          description="E (eV) = 1239.84 / λ (nm)."
          accent="bg-violet/15 text-violet"
        >
          <Field label="Wavelength λ (nm)">
            <Input type="number" step="1" min="1" value={nm} onChange={(e) => setNm(e.target.value)} />
          </Field>
          <ResultRow label="Photon energy" value={ev > 0 && Number.isFinite(ev) ? ev.toFixed(3) : "—"} unit="eV" />
          <div className="rounded-xl border border-line bg-panel/70 px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
            {Number(nm) >= 380 && Number(nm) <= 750
              ? "Inside the visible spectrum — useful context for photocatalytic band-gap screening."
              : Number(nm) < 380
                ? "Ultraviolet — relevant for TiO₂ and ZnO photocatalysis."
                : "Infrared — below typical semiconductor band-gap energies."}
          </div>
          <p className="text-[11.5px] text-ink-muted">
            Reverse: {ev > 0 && Number.isFinite(ev) ? evToWavelength(ev).toFixed(0) : "—"} nm at{" "}
            {ev > 0 && Number.isFinite(ev) ? ev.toFixed(3) : "—"} eV.
          </p>
        </ToolCard>
      </div>

      <Card className="mt-5 flex items-start gap-3 p-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
          <Calculator className="size-4.5" />
        </span>
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          These tools run entirely in your browser with no network calls. They implement textbook equations directly, but the
          inputs you type are yours — always cross-check values against your instrument calibration and primary literature.
        </p>
      </Card>
    </div>
  );
}
