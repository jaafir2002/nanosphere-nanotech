import { Hero } from "@/components/dashboard/Hero";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { TrendingMaterials } from "@/components/dashboard/TrendingMaterials";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LatestResearch } from "@/components/dashboard/LatestResearch";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ComparisonChart } from "@/components/dashboard/ComparisonChart";
import { PromoCard } from "@/components/dashboard/PromoCard";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1440px]">
      <Hero />

      <div className="mt-5">
        <QuickAccess />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-9">
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8 xl:col-span-8">
              <TrendingMaterials />
            </div>
            <div className="lg:col-span-4 xl:col-span-4">
              <QuickActions />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-5 xl:col-span-4">
              <RecentActivity />
            </div>
            <div className="lg:col-span-7 xl:col-span-8">
              <ComparisonChart />
            </div>
          </div>
        </div>

        <aside className="space-y-5 xl:col-span-3">
          <LatestResearch />
          <PromoCard />
        </aside>
      </div>
    </div>
  );
}
