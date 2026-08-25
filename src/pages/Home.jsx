import { Wallet, Clapperboard, Sparkles } from "lucide-react";
import { LibraryHomeCard } from "../domains/library/components/LibraryHomeCard";
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
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          Project Nova
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          A growing collection of personal tools, all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <LibraryHomeCard />

        <UtilityCard
          icon={Clapperboard}
          title="MCU"
          description="Track Marvel watch order and progress"
          badgeLabel="Phase 2"
        >
          <ComingSoonFeatures
            features={[
              "Timeline order by release date",
              "Watched progress tracker",
              "Details per film/show",
            ]}
          />
        </UtilityCard>
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
