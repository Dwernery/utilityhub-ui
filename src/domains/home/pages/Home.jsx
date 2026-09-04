import { Wallet } from "lucide-react";
import { LibraryHomeCard } from "../components/LibraryHomeCard";
import { McuHomeCard } from "../components/McuHomeCard";
import { UtilityCard } from "../components/UtilityCard";

function ComingSoonFeatures({ features }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {features.map((feature) => (
        <li
          key={feature}
          className="flex items-center gap-2 text-xs text-slate-400"
        >
          <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
          {feature}
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <div>
      <div className="mb-6 text-center sm:text-left flex gap-3 items-center">
        <img src="/logo.png" alt="Logo" className="w-16 h-16" />
        <div className="flex-col">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-3">
            Project SHIELD
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            A growing collection of personal tools, all in one place.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <LibraryHomeCard />

        <McuHomeCard />

        <UtilityCard
          icon={Wallet}
          title="Finances"
          description="Budgeting, income, and net worth summaries"
          badgeLabel="Phase 3"
        >
          <ComingSoonFeatures
            features={[
              "Yearly income tracking",
              "Monthly spending tracking",
              "Account balance overview",
            ]}
          />
        </UtilityCard>
      </div>
    </div>
  );
}
