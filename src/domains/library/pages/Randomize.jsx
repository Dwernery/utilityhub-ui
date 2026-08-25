import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useBooks } from "../hooks/useBooks.js";
import { useStartReading } from "../hooks/useStartReading.js";
import { Book } from "lucide-react";
import { RandomCategories } from "../components/randomize/RandomCategories.jsx";
import { RandomSelector } from "../components/randomize/RandomSelector.jsx";
import { EligibleBooks } from "../components/randomize/EligibleBooks.jsx";

export default function Randomize() {
  const [category, setCategory] = useState("standalone");
  const [pick, setPick] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const lastPickRef = useRef(null);
  const spinTimeoutRef = useRef(null);
  const { data: books = [] } = useBooks();
  const { startReading, isPending: isStartingReading } = useStartReading();

  const seriesSizes = useMemo(() => {
    const map = {};
    books.forEach((b) => {
      if (b.seriesName) map[b.seriesName] = (map[b.seriesName] || 0) + 1;
    });
    return map;
  }, [books]);

  const categorize = useCallback(
    (book) => {
      if (!book.seriesName) return "standalone";
      return seriesSizes[book.seriesName] <= 3 ? "short" : "long";
    },
    [seriesSizes],
  );

  const eligibleSeries = useMemo(() => {
    const bySeries = {};

    books.forEach((book) => {
      if (!book.seriesName) return;
      if (!bySeries[book.seriesName]) bySeries[book.seriesName] = [];
      bySeries[book.seriesName].push(book);
    });

    return Object.fromEntries(
      Object.entries(bySeries)
        .filter(([, seriesBooks]) =>
          seriesBooks.every((book) => book.status === "UNREAD"),
        )
        .map(([seriesName]) => [seriesName, true]),
    );
  }, [books]);

  const pools = useMemo(() => {
    const p = { standalone: [], short: [], long: [] };
    books
      .filter((b) => b.status === "UNREAD")
      .forEach((b) => {
        if (b.seriesName && !eligibleSeries[b.seriesName]) return;
        p[categorize(b)].push(b);
      });
    return p;
  }, [books, categorize, eligibleSeries]);

  const seriesGroups = useMemo(() => {
    const make = (cat) => {
      const bySeries = {};
      pools[cat].forEach((b) => {
        if (!bySeries[b.seriesName]) bySeries[b.seriesName] = [];
        bySeries[b.seriesName].push(b);
      });

      return Object.entries(bySeries)
        .map(([series]) => {
          const booksInSeries = books
            .filter((b) => b.seriesName === series)
            .sort((a, b) => a.id - b.id);
          const firstBook = booksInSeries[0];

          return {
            series,
            firstBook,
            books: booksInSeries,
            representativeBook: firstBook,
            totalInSeries: seriesSizes[series],
          };
        })
        .sort((a, b) => a.series.localeCompare(b.series));
    };

    return { short: make("short"), long: make("long") };
  }, [pools, books, seriesSizes]);

  const counts = useMemo(
    () => ({
      standalone: pools.standalone.length,
      short: seriesGroups.short.length,
      long: seriesGroups.long.length,
    }),
    [pools, seriesGroups],
  );

  const roll = useCallback(() => {
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }

    if (category === "standalone") {
      const candidates = pools.standalone;
      if (!candidates.length) return;

      setIsSpinning(true);
      spinTimeoutRef.current = setTimeout(() => {
        let next,
          tries = 0;
        do {
          next = candidates[Math.floor(Math.random() * candidates.length)];
          tries++;
        } while (
          next?.id === lastPickRef.current?.id &&
          candidates.length > 1 &&
          tries < 10
        );

        lastPickRef.current = next;
        setPick(next);
        setIsSpinning(false);
        spinTimeoutRef.current = null;
      }, 300);
      return;
    }

    const groups = seriesGroups[category];
    if (!groups.length) return;

    setIsSpinning(true);
    spinTimeoutRef.current = setTimeout(() => {
      let next,
        tries = 0;
      do {
        next = groups[Math.floor(Math.random() * groups.length)];
        tries++;
      } while (
        next?.series === lastPickRef.current?.series &&
        groups.length > 1 &&
        tries < 10
      );

      lastPickRef.current = next;
      setPick({
        type: "series",
        seriesName: next.series,
        title: next.series,
        authorName: next.firstBook.authorName,
        pages: next.firstBook.pages,
        firstBook: next.firstBook,
        books: next.books,
        id: next.firstBook.id,
      });
      setIsSpinning(false);
      spinTimeoutRef.current = null;
    }, 300);
  }, [pools, seriesGroups, category]);

  useEffect(() => {
    lastPickRef.current = null;
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }

    // Refs are cleared synchronously above; the setState calls are deferred
    // to a microtask so this effect doesn't call setState directly in its
    // body (which triggers cascading renders per the react-hooks lint rule).
    queueMicrotask(() => {
      setPick(null);
      setIsSpinning(false);
    });
  }, [category]);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
        spinTimeoutRef.current = null;
      }
    };
  }, []);

  const eligibleCount =
    category === "standalone"
      ? pools.standalone.length
      : (seriesGroups[category]?.length ?? 0);

  const handleStartReading = useCallback(() => {
    if (!pick) return;

    const startBook = pick.type === "series" ? pick.firstBook : pick;

    startReading(startBook, {
      onSuccess: () => {
        setPick(null);
        lastPickRef.current = null;
      },
    });
  }, [pick, startReading]);

  return (
    <div className="space-y-4">
      <RandomCategories
        category={category}
        setCategory={setCategory}
        counts={counts}
      />
      {eligibleCount === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
          <Book className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">
            No unread books in this category.
          </p>
        </div>
      ) : (
        <>
          <RandomSelector
            pick={pick}
            counts={counts}
            category={category}
            roll={roll}
            seriesSizes={seriesSizes}
            isSpinning={isSpinning || isStartingReading}
            onStartReading={handleStartReading}
          />
          <EligibleBooks
            category={category}
            pools={pools}
            seriesGroups={seriesGroups}
            pick={pick}
          />
        </>
      )}
    </div>
  );
}
