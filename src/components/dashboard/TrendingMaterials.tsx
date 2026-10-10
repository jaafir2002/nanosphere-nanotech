import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, SectionHeader, Badge, categoryTone } from "@/components/ui";
import { MaterialArt } from "@/art";
import { MATERIALS, TRENDING_IDS, getMaterial } from "@/data/materials";

export function TrendingMaterials() {
  const navigate = useNavigate();
  const items = TRENDING_IDS.map((id) => getMaterial(id)).filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <Card className="overflow-hidden">
      <SectionHeader
        title="Trending Nanomaterials"
        action={
          <Link
            to="/explore"
            className="inline-flex items-center gap-1 text-[12.5px] font-medium text-blue-soft transition hover:gap-1.5 hover:underline"
          >
            View All <ArrowRight className="size-3.5" />
          </Link>
        }
      />
      <div className="grid gap-3.5 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((m) => (
          <button
            key={m.id}
            onClick={() => navigate(`/materials/${m.id}`)}
            className="group overflow-hidden rounded-xl border border-line bg-panel/70 text-left transition-all duration-200 hover:-translate-y-1 hover:border-blue-soft/40"
          >
            <div className="h-[86px] overflow-hidden">
              <MaterialArt kind={m.art} accent={m.accent} className="transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-3.5">
              <p className="text-[13.5px] font-semibold text-ink">{m.name}</p>
              <p className="mt-1 line-clamp-2 min-h-[32px] text-[12px] leading-relaxed text-ink-muted">{m.tagline}</p>
              <Badge tone={categoryTone(m.category)} className="mt-2.5">
                {m.category}
              </Badge>
            </div>
          </button>
        ))}
      </div>
      <p className="hidden px-5 pb-4 text-[11.5px] text-ink-muted xl:block">
        Based on {MATERIALS.filter((m) => m.trending).length} trending entries in the sample catalogue · updated continuously
      </p>
    </Card>
  );
}
