
// ── Random Book Picker ────────────────────────────────────────────────────────
function RandomBookPicker({ books, onStartReading, onBookClick }) {
  const [category, setCategory] = useState('standalone');
  const [pick, setPick] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const lastPickRef = useRef(null);

  const seriesSizes = useMemo(() => {
    const map = {};
    books.forEach(b => { if (b.series) map[b.series] = (map[b.series] || 0) + 1; });
    return map;
  }, [books]);

  const categorize = useCallback((book) => {
    if (!book.series) return 'standalone';
    return seriesSizes[book.series] <= 3 ? 'short' : 'long';
  }, [seriesSizes]);

  // pools: unread books by category
  const pools = useMemo(() => {
    const p = { standalone: [], short: [], long: [] };
    books.filter(b => b.status === 'unread').forEach(b => { p[categorize(b)].push(b); });
    return p;
  }, [books, categorize]);

  // For short/long: group books by series, pick the next unread book per series
  const seriesGroups = useMemo(() => {
    const make = (cat) => {
      const bySeries = {};
      // collect ALL books in the series (not just unread) to get book 1
      pools[cat].forEach(b => {
        if (!bySeries[b.series]) bySeries[b.series] = [];
        bySeries[b.series].push(b);
      });
      return Object.entries(bySeries).map(([series, sBooks]) => {
        // Always show the first book in the series by id, which is book 1
        const allSeriesBooks = books.filter(b => b.series === series).sort((a, b) => a.id - b.id);
        const firstBook = allSeriesBooks[0];
        return { series, nextBook: firstBook, totalInSeries: seriesSizes[series] };
      }).sort((a, b) => a.series.localeCompare(b.series));
    };
    return { short: make('short'), long: make('long') };
  }, [pools, books, seriesSizes]);

  const counts = useMemo(() => ({
    standalone: pools.standalone.length,
    short: seriesGroups.short.length,
    long: seriesGroups.long.length,
  }), [pools, seriesGroups]);

  // Reset pick on category change
  useEffect(() => { setPick(null); lastPickRef.current = null; }, [category]);

  const roll = useCallback(() => {
    if (category === 'standalone') {
      const candidates = pools.standalone;
      if (!candidates.length) return;
      setIsSpinning(true);
      setTimeout(() => {
        let next, tries = 0;
        do {
          next = candidates[Math.floor(Math.random() * candidates.length)];
          tries++;
        } while (next?.id === lastPickRef.current?.id && candidates.length > 1 && tries < 10);
        lastPickRef.current = next;
        setPick(next);
        setIsSpinning(false);
      }, 300);
    } else {
      const groups = seriesGroups[category];
      if (!groups.length) return;
      setIsSpinning(true);
      setTimeout(() => {
        let next, tries = 0;
        do {
          next = groups[Math.floor(Math.random() * groups.length)];
          tries++;
        } while (next?.series === lastPickRef.current?.series && groups.length > 1 && tries < 10);
        lastPickRef.current = next;
        setPick(next.nextBook);
        setIsSpinning(false);
      }, 300);
    }
  }, [pools, seriesGroups, category]);

  const seriesProgress = pick?.series
    ? books.filter(b => b.series === pick.series && b.status === 'read').length
    : null;

  const categoryDefs = [
    { id: 'standalone', label: 'Standalones', sub: null },
    { id: 'short', label: 'Short series', sub: '2–3 books' },
    { id: 'long', label: 'Long series', sub: '4+ books' },
  ];

  const isEmpty = category === 'standalone' ? pools.standalone.length === 0
    : seriesGroups[category].length === 0;

  return (
    <div className="space-y-4">
      {/* Category pills */}
      <div className="grid grid-cols-3 gap-2">
        {categoryDefs.map(({ id, label, sub }) => (
          <button key={id} onClick={() => setCategory(id)}
            className={`rounded-xl border py-3 px-2 text-center transition-all duration-150 ${
              category === id ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}>
            <div className={`text-2xl font-bold ${category === id ? 'text-blue-600' : 'text-slate-700'}`}>{counts[id]}</div>
            <div className={`text-xs font-medium mt-0.5 ${category === id ? 'text-blue-700' : 'text-slate-500'}`}>{label}</div>
            {sub && <div className="text-xs text-slate-400">{sub}</div>}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
          <Book className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No unread books in this category.</p>
        </div>
      ) : (
        <>
          {/* Pick button / result card */}
          {!pick ? (
            <div className="bg-white rounded-xl border border-slate-200 py-12 text-center shadow-sm">
              <Shuffle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-5">
                {counts[category]} {category === 'standalone' ? 'book' : 'series'}{counts[category] !== 1 ? 's' : ''} to choose from
              </p>
              <button onClick={roll}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                <Shuffle className="w-4 h-4" /> Pick for me
              </button>
            </div>
          ) : (
            <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-opacity duration-200 ${isSpinning ? 'opacity-40' : 'opacity-100'}`}>
              <div className="flex gap-4 p-4">
                <div className="w-20 h-28 rounded-lg flex-shrink-0 overflow-hidden shadow-md border border-slate-100">
                  <BookCover book={pick} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-base font-bold text-slate-800 leading-snug">{pick.title}</h3>
                  <button onClick={() => onBookClick(pick)} className="text-sm text-blue-600 hover:underline mt-0.5 text-left">{pick.author}</button>
                  {pick.series && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                      <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-100">{pick.series}</span>
                      <span className="text-xs text-slate-400">Book 1 of {seriesSizes[pick.series]}</span>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                    <Book className="w-3.5 h-3.5" />{pick.totalPages.toLocaleString()} pages
                  </div>
                </div>
              </div>
              <div className="flex gap-2 px-4 pb-4">
                <button onClick={() => onStartReading(pick.id)}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-white" /> Start reading
                </button>
                <button onClick={roll} disabled={isSpinning}
                  className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <RotateCcw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} /> Reroll
                </button>
              </div>
            </div>
          )}

          {/* Always-visible eligible list */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">
                {category === 'standalone'
                  ? `All eligible books (${pools.standalone.length})`
                  : `All eligible series (${seriesGroups[category].length})`}
              </span>
            </div>
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {category === 'standalone'
                ? pools.standalone.map(book => (
                    <button key={book.id}
                      onClick={() => { lastPickRef.current = book; setPick(book); }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors ${pick?.id === book.id ? 'bg-blue-50' : ''}`}>
                      <div className="w-7 h-10 rounded flex-shrink-0 overflow-hidden">
                        <BookCover book={book} className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${pick?.id === book.id ? 'text-blue-700' : 'text-slate-800'}`}>{book.title}</div>
                        <div className="text-xs text-slate-400 truncate">{book.author}</div>
                      </div>
                      {pick?.id === book.id && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    </button>
                  ))
                : seriesGroups[category].map(({ series, nextBook, totalInSeries }) => {
                    const isSelected = pick?.series === series;
                    return (
                      <button key={series}
                        onClick={() => { lastPickRef.current = nextBook; setPick(nextBook); }}
                        className={`w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                        <div className="w-7 h-10 rounded flex-shrink-0 overflow-hidden">
                          <BookCover book={nextBook} className="w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{series}</div>
                          <div className="text-xs text-slate-400 truncate">{nextBook.author} · Book 1 of {totalInSeries}</div>
                        </div>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                      </button>
                    );
                  })
              }
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function BookInventoryDashboard() {
  const [customAuthors, setCustomAuthors] = useState([]);
  const [customSeries, setCustomSeries]   = useState([]);
  const [searchTerm, setSearchTerm]       = useState('');
  const [showAddForm, setShowAddForm]     = useState(false);
  const [newBook, setNewBook]             = useState({ title: '', author: '', series: '', totalPages: '', isbn: '' });
  const [activeTab, setActiveTab]         = useState('inventory');
  const [selectedBook, setSelectedBook]   = useState(null);
  const [isEditingInDialog, setIsEditingInDialog] = useState(false);
  const [selectedReadingYear, setSelectedReadingYear] = useState(null);
  const [showAddCurrentlyReading, setShowAddCurrentlyReading] = useState(false);
  const [currentlyReadingSearch, setCurrentlyReadingSearch]   = useState('');
  const [authorStatsFor, setAuthorStatsFor] = useState(null);


  const metrics = useMemo(() => {
    const readBooks = books.filter(b => b.status === 'read' && b.endDate);
    const byYear = {};
    readBooks.forEach(b => {
      const y = new Date(b.endDate).getFullYear();
      if (!byYear[y]) byYear[y] = { books: 0, pages: 0 };
      byYear[y].books++; byYear[y].pages += b.totalPages;
    });
    const allTimeBooks = readBooks.length;
    const allTimePages = readBooks.reduce((s, b) => s + b.totalPages, 0);
    const availableYears = Object.keys(byYear).map(Number).sort((a, b) => b - a);
    const yearComparisons = availableYears.map((year, i) => {
      const curr = byYear[year];
      const prev = availableYears[i + 1] ? byYear[availableYears[i + 1]] : null;
      const booksDiff = prev !== null ? curr.books - prev.books : null;
      const pagesDiff = prev !== null ? curr.pages - prev.pages : null;
      return {
        year, books: curr.books, pages: curr.pages, booksDiff, pagesDiff,
        booksPercentChange: prev ? Math.round((booksDiff / prev.books) * 100) : null,
      };
    });
    const byMonth = {};
    const src = selectedReadingYear ? readBooks.filter(b => new Date(b.endDate).getFullYear() === selectedReadingYear) : readBooks;
    src.forEach(b => {
      const m = new Date(b.endDate).getMonth();
      if (!byMonth[m]) byMonth[m] = { books: 0, pages: 0 };
      byMonth[m].books++; byMonth[m].pages += b.totalPages;
    });
    return { byYear, byMonth, allTimeBooks, allTimePages, availableYears, yearComparisons };
  }, [books, selectedReadingYear]);




  const updateBookProgress = (id, v) => setBooks(books.map(b => b.id === id ? { ...b, currentPage: parseInt(v) || 0 } : b));
  const deleteBook         = (id) => { setBooks(books.filter(b => b.id !== id)); setSelectedBook(null); setIsEditingInDialog(false); };
  const saveBookFromDialog = () => { if (selectedBook?.title && selectedBook?.author) { setBooks(books.map(b => b.id === selectedBook.id ? selectedBook : b)); setIsEditingInDialog(false); } };
  const startReading = (id) => {
    const t = new Date().toISOString().split('T')[0];
    setBooks(books.map(b => b.id === id ? { ...b, status: 'in-progress', startDate: t, currentPage: 0 } : b));
    setShowAddCurrentlyReading(false); setCurrentlyReadingSearch('');
  };
  const completeBook = (id) => {
    const t = new Date().toISOString().split('T')[0];
    setBooks(books.map(b => b.id === id ? { ...b, status: 'read', endDate: t, currentPage: b.totalPages } : b));
  };
  const removeFromCurrentlyReading = (id) => setBooks(books.map(b => b.id === id ? { ...b, status: 'unread', startDate: null, currentPage: 0 } : b));

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (

        {/* ── METRICS TAB ── */}
        {activeTab === 'reading' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800 text-sm">Currently Reading</h2>
                <button onClick={() => setShowAddCurrentlyReading(true)}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />Start Reading
                </button>
              </div>
              {books.filter(b => b.status === 'in-progress').length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {books.filter(b => b.status === 'in-progress').map(book => {
                    const pct = Math.round((book.currentPage / book.totalPages) * 100);
                    const days = book.startDate ? Math.ceil((new Date() - new Date(book.startDate)) / 86400000) : null;
                    return (
                      <div key={book.id} className="px-4 py-3">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 text-sm truncate">{book.title}</div>
                            <div className="text-xs text-slate-400">{book.author}{days !== null ? ` · ${days}d` : ''}</div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button onClick={() => completeBook(book.id)} className="px-2.5 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-xs font-medium transition-colors">Done</button>
                            <button onClick={() => removeFromCurrentlyReading(book.id)} className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md text-xs font-medium transition-colors">Remove</button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <input type="number" value={book.currentPage} onChange={e => updateBookProgress(book.id, e.target.value)}
                            className="w-14 px-2 py-0.5 border border-slate-200 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-400" />
                          <span className="text-xs text-slate-400">/{book.totalPages}</span>
                          <span className="text-xs font-medium text-slate-500 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="px-4 py-4 text-sm text-slate-400">No books in progress.</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[['Books read', metrics.allTimeBooks], ['Pages', metrics.allTimePages.toLocaleString()], ['Avg pages', metrics.allTimeBooks > 0 ? Math.round(metrics.allTimePages / metrics.allTimeBooks) : 0]].map(([label, val]) => (
                <div key={label} className="bg-white rounded-xl border border-slate-200 px-3 py-3 text-center shadow-sm">
                  <div className="text-xl font-bold text-slate-800">{val}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {metrics.yearComparisons.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 pt-4 pb-3">
                <h2 className="font-semibold text-slate-800 mb-3 text-sm">Books per year</h2>
                {(() => {
                  const CHART_H = 96;
                  const maxBooks = Math.max(...metrics.yearComparisons.map(y => y.books), 1);
                  const sorted = [...metrics.yearComparisons].sort((a, b) => a.year - b.year);
                  return (
                    <div>
                      <div className="flex items-end gap-1.5 mb-1" style={{ height: CHART_H }}>
                        {sorted.map(yd => {
                          const barH = Math.max(Math.round((yd.books / maxBooks) * CHART_H), 4);
                          const isSel = selectedReadingYear === yd.year;
                          return (
                            <button key={yd.year} onClick={() => setSelectedReadingYear(isSel ? null : yd.year)}
                              className="flex-1 flex flex-col items-center justify-end gap-1 group h-full">
                              <span className={`text-xs font-semibold leading-none ${isSel ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{yd.books}</span>
                              <div className={`w-full rounded-t transition-colors ${isSel ? 'bg-blue-500' : 'bg-blue-200 group-hover:bg-blue-400'}`} style={{ height: barH }} />
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-1.5">
                        {sorted.map(yd => (
                          <button key={yd.year} onClick={() => setSelectedReadingYear(selectedReadingYear === yd.year ? null : yd.year)}
                            className={`flex-1 text-center text-xs truncate transition-colors ${selectedReadingYear === yd.year ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                            {String(yd.year).slice(2)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {metrics.yearComparisons.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-800 text-sm">Year comparison</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {[...metrics.yearComparisons].sort((a, b) => b.year - a.year).map(yd => {
                    const isSel = selectedReadingYear === yd.year;
                    const hasDiff = yd.booksDiff !== null;
                    return (
                      <button key={yd.year} onClick={() => setSelectedReadingYear(isSel ? null : yd.year)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${isSel ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                        <span className={`text-sm font-bold w-10 flex-shrink-0 ${isSel ? 'text-blue-600' : 'text-slate-700'}`}>{yd.year}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-3">
                            <span className="text-sm font-semibold text-slate-800">{yd.books} books</span>
                            <span className="text-xs text-slate-400">{yd.pages.toLocaleString()} pages</span>
                          </div>
                          {hasDiff ? (
                            <div className={`text-xs mt-0.5 font-medium ${yd.booksDiff > 0 ? 'text-green-600' : yd.booksDiff < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                              {yd.booksDiff > 0 ? '+' : ''}{yd.booksDiff} vs {yd.year - 1}
                              {yd.booksPercentChange !== null && ` (${yd.booksPercentChange > 0 ? '+' : ''}${yd.booksPercentChange}%)`}
                            </div>
                          ) : (
                            <div className="text-xs mt-0.5 text-slate-300">No prior year</div>
                          )}
                        </div>
                        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isSel ? 'rotate-180 text-blue-500' : '-rotate-90 text-slate-300'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedReadingYear !== null && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800 text-sm">{selectedReadingYear}</h2>
                  <button onClick={() => setSelectedReadingYear(null)} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
                </div>
                <div className="px-4 pt-3 pb-2">
                  <div className="text-xs text-slate-400 mb-2">By month</div>
                  <div className="space-y-1.5">
                    {monthNames.map((month, idx) => {
                      const md = metrics.byMonth[idx];
                      const maxB = Math.max(...Object.values(metrics.byMonth).map(m => m?.books || 0), 1);
                      const bw = md ? (md.books / maxB) * 100 : 0;
                      return (
                        <div key={month} className="flex items-center gap-2">
                          <div className="w-7 text-xs text-slate-400">{month}</div>
                          <div className="flex-1 bg-slate-100 rounded h-5 overflow-hidden">
                            {md && <div className="bg-blue-400 h-full rounded flex items-center px-2 transition-all duration-300" style={{ width: `${bw}%` }}>
                              {bw > 20 && <span className="text-xs font-semibold text-white">{md.books}</span>}
                            </div>}
                          </div>
                          {md && bw <= 20 && <div className="text-xs text-slate-500 w-4">{md.books}</div>}
                          {!md && <div className="text-xs text-slate-300 w-4">—</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t border-slate-100">
                  <div className="px-4 py-2 text-xs text-slate-400">
                    {books.filter(b => b.status === 'read' && b.endDate && new Date(b.endDate).getFullYear() === selectedReadingYear).length} books finished
                  </div>
                  <div className="divide-y divide-slate-100">
                    {books.filter(b => b.status === 'read' && b.endDate && new Date(b.endDate).getFullYear() === selectedReadingYear)
                      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
                      .map(book => {
                        const days = book.startDate && book.endDate ? Math.ceil((new Date(book.endDate) - new Date(book.startDate)) / 86400000) : null;
                        return (
                          <div key={book.id} className="px-4 py-2.5 flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-800 truncate">{book.title}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-400">{book.author}</span>
                                {book.rating > 0 && <StarRating value={book.rating} readonly size="sm" />}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-slate-400">{book.totalPages}p</div>
                              {days !== null && <div className="text-xs text-slate-300">{days}d</div>}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {metrics.yearComparisons.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                Complete some books to see your reading history.
              </div>
            )}
          </div>
        )}

        {/* ── PICK TAB ── */}
        {activeTab === 'pick' && (
          <RandomBookPicker
            books={books}
            onStartReading={(id) => { startReading(id); setActiveTab('reading'); }}
            onBookClick={(book) => openBookDialog(book)}
          />
        )}
      </div>


      {/* Start Reading Modal */}
      {showAddCurrentlyReading && (

      )}
    </div>
  );
}
