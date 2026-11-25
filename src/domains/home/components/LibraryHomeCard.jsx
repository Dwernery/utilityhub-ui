import { Book } from "lucide-react";
import { useBooks } from "../../library/hooks";
import { libraryHomeStats } from "../../library/utils/homeStats";
import { RefreshNotice, UtilityCard, UtilityCardSkeleton } from "./UtilityCard";
import { LoadError } from "../../../components/LoadError";
import { LibraryStatsSection } from "./LibraryStatsSection";
import { LibraryCurrentlyReading } from "./LibraryCurrentlyReading";

export function LibraryHomeCard() {
  const {
    data: books = [],
    isPending,
    isLoadingError,
    isRefetchError,
    error,
    refetch,
    isFetching,
  } = useBooks();

  const { allTime, thisYear, inProgress } = libraryHomeStats(books);

  if (isPending) {
    return (
      <UtilityCard icon={Book} title="Library" to="/library/inventory">
        <UtilityCardSkeleton />
      </UtilityCard>
    );
  }

  if (isLoadingError) {
    return (
      <UtilityCard
        icon={Book}
        title="Library"
        to="/library/inventory"
        linked={false}
      >
        <LoadError
          what="library"
          error={error}
          onRetry={() => refetch()}
          retrying={isFetching}
          card={false}
        />
      </UtilityCard>
    );
  }

  return (
    <UtilityCard
      icon={Book}
      title="Library"
      to="/library/inventory"
      notice={
        isRefetchError && (
          <RefreshNotice onRetry={() => refetch()} retrying={isFetching} />
        )
      }
    >
      <LibraryStatsSection label="All-Time" {...allTime} />

      <div className="border-t border-slate-100 pt-2 mt-2">
        <LibraryStatsSection label={new Date().getFullYear()} {...thisYear} />
      </div>

      <div className="border-t border-slate-100 pt-2 mt-2">
        <LibraryCurrentlyReading books={inProgress} />
      </div>
    </UtilityCard>
  );
}
