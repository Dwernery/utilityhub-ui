import { Clapperboard } from "lucide-react";
import { McuCurrentlyWatching } from "./McuCurrentlyWatching";
import { useMemo } from "react";
import { useMcuTracker } from "../../mcu/context/McuTrackerContext";
import { useMcuTrackerData } from "../../mcu/hooks";
import { normalizeTrackerData } from "../../mcu/utils/normalizeTrackerData";
import { combineStats, computeStats } from "../../mcu/utils/stats";
import { UtilityCard, UtilityCardSkeleton } from "./UtilityCard";
import { LoadError } from "../../../components/LoadError";
import { McuStatsSection } from "./McuStatsSection";

export function McuHomeCard() {
  const { watched } = useMcuTracker();
  const {
    data = { domains: [] },
    isPending,
    isLoadingError,
    error,
    refetch,
    isFetching,
  } = useMcuTrackerData();
  const { phases, expandedCategories } = useMemo(
    () => normalizeTrackerData(data),
    [data],
  );
  const mcuStats = useMemo(
    () =>
      combineStats(phases.map((phase) => computeStats(phase.items, watched))),
    [phases, watched],
  );
  const expandedStats = useMemo(
    () =>
      combineStats(
        expandedCategories.map((category) =>
          computeStats(category.items, watched),
        ),
      ),
    [expandedCategories, watched],
  );

  const inProgress = data.domains.flatMap((domain) => [
    ...(domain.movies ?? [])
      .filter((item) => item.status === "IN_PROGRESS")
      .map((movie) => ({
        ...movie,
        domainName: domain.domainName,
      })),

    ...(domain.shows ?? []).flatMap((show) =>
      (show.seasons ?? []).flatMap((season) =>
        (season.episodes ?? [])
          .filter((episode) => episode.status === "IN_PROGRESS")
          .map((episode) => ({
            ...episode,
            s3Url: show.s3Url,
            showTitle: show.title,
            showGlobalId: show.globalId,
            seasonNumber: season.seasonNumber,
            domainName: domain.domainName,
          })),
      ),
    ),
  ]);

  if (isPending) {
    return (
      <UtilityCard icon={Clapperboard} title="MCU" to="/mcu/tracker">
        <UtilityCardSkeleton />
      </UtilityCard>
    );
  }

  if (isLoadingError) {
    return (
      <UtilityCard
        icon={Clapperboard}
        title="MCU"
        to="/mcu/tracker"
        linked={false}
      >
        <LoadError
          what="MCU data"
          error={error}
          onRetry={() => refetch()}
          retrying={isFetching}
          card={false}
        />
      </UtilityCard>
    );
  }

  return (
    <UtilityCard icon={Clapperboard} title="MCU" to="/mcu/tracker">
      <McuStatsSection label="MCU Phases" stats={mcuStats} />

      <div className="border-t border-slate-100 pt-2 mt-2">
        <McuStatsSection label="Expanded Universe" stats={expandedStats} />
      </div>

      <div className="border-t border-slate-100 pt-2 mt-2">
        <McuCurrentlyWatching content={inProgress} />
      </div>
    </UtilityCard>
  );
}
