import { Clapperboard } from "lucide-react";
import { MCUCurrentlyWatching } from "./MCUCurrentlyWatching";
import { useMemo } from "react";
import { useMcuTracker } from "../../mcu/context/McuTrackerContext";
import { useMcuTrackerData } from "../../mcu/hooks/useMcuTrackerData";
import { normalizeTrackerData } from "../../mcu/utils/normalizeTrackerData";
import { combineStats, computeStats } from "../../mcu/utils/stats";
import { UtilityCard } from "./UtilityCard";
import { MCUStatsSection } from "./MCUStatsSection";


export function McuHomeCard() {
  const { watched } = useMcuTracker();
  const { data = { domains: [] }, isPending, isError, error } = useMcuTrackerData();
  const { phases, expandedCategories } = useMemo(() => normalizeTrackerData(data),
    [data]);
  const mcuStats = useMemo(() => combineStats(phases.map((phase) => computeStats(phase.items, watched))),
    [phases, watched]);
  const expandedStats = useMemo(() => combineStats(expandedCategories.map((category) => computeStats(category.items, watched))),
    [expandedCategories, watched]);

  const inProgress = data.domains.flatMap(domain => [
    ...(domain.movies ?? [])
      .filter(item => item.status === "IN_PROGRESS")
      .map(movie => ({
        ...movie,
        domainName: domain.domainName,
      })),

    ...(domain.shows ?? []).flatMap(show =>
      (show.seasons ?? []).flatMap(season =>
        (season.episodes ?? [])
          .filter(episode => episode.status === "IN_PROGRESS")
          .map(episode => ({
            ...episode,
            s3Url: show.s3Url,
            showTitle: show.title,
            showGlobalId: show.globalId,
            seasonNumber: season.seasonNumber,
            domainName: domain.domainName,
          }))
      )
    ),
  ]);

  if (isPending) {
    return (
      <UtilityCard icon={Clapperboard} title="MCU" to="/mcu/tracker">
        <div className="mt-4 space-y-3 animate-pulse">
          <div className="h-12 bg-slate-100 rounded-lg" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
      </UtilityCard>
    );
  }

  if (isError) {
    return (
      <UtilityCard icon={Clapperboard} title="MCU" to="/mcu/tracker">
        <p className="text-sm text-red-500 mt-4">
          Failed to load MCU data
          {error?.message ? `: ${error.message}` : "."}
        </p>
      </UtilityCard>
    );
  }
  
  return (
    <UtilityCard icon={Clapperboard} title="MCU" to="/mcu/tracker">
      <MCUStatsSection label="MCU Phases" stats={mcuStats} />

      <div className="border-t border-slate-100 pt-3 mt-3">
        <MCUStatsSection label="Expanded Universe" stats={expandedStats} />
      </div>

      <div className="border-t border-slate-100 pt-3 mt-3">
        <MCUCurrentlyWatching content={inProgress} />
      </div>
    </UtilityCard>
  );
}
