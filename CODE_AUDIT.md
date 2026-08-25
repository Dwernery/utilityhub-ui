# Code Audit Checkpoint

Generated: 2026-08-24
Scope: `src/**` (React 19 + React Router v7 + TanStack Query v5), plus root-level legacy file.

Use this as a working checklist. Check items off as they're fixed. Suggested order: **Critical → High → Medium → Low**, following the "Fix immediately / Fix soon / Nice-to-have" grouping at the bottom.

---

## CRITICAL

- [x] **1. Rating rollback race reopens closed modal with stale data**
      File: [src/domains/library/components/BookDetailModal.jsx](src/domains/library/components/BookDetailModal.jsx) — `handleRatingChange`
      Problem: `onError` calls `setSelectedBook({ ...selectedBook, rating: prevRating })` using a closed-over `selectedBook` from when the mutation started. If the modal is closed (`selectedBook` → `null`) before the mutation settles, spreading `{...null}` produces `{}`, and `setSelectedBook({ rating: prevRating })` makes `selectedBook` non-null again — silently reopening the modal with a corrupted/partial book object.
      Fix: Guard the callback so it only applies if the book is still the one being viewed (e.g. compare against the book id at mutation start), or restructure so rollback targets the `books` query cache instead of context state.

- [x] **2. Query loading/error states never surfaced**
      Files: [src/domains/library/hooks/useGetBooks.js](src/domains/library/hooks/useGetBooks.js), [useGetAuthors.js](src/domains/library/hooks/useGetAuthors.js), [useGetSeries.js](src/domains/library/hooks/useGetSeries.js) and all consumers ([Inventory.jsx](src/domains/library/pages/Inventory.jsx), [Header.jsx](src/domains/library/components/Header.jsx), [Metrics.jsx](src/domains/library/pages/Metrics.jsx), [Randomize.jsx](src/domains/library/pages/Randomize.jsx), [AuthorDetailModal.jsx](src/domains/library/components/AuthorDetailModal.jsx))
      Problem: No component reads `isLoading`/`isError`/`error`; everything defaults to `data = []`. Loading, empty, and failed-fetch states are visually identical.
      Fix: Surface `isPending`/`isError` — at minimum a loading skeleton and an error toast/banner in `Inventory` and `Metrics`.

- [x] **3. Missing query invalidation for authors/series creation**
      Files: [useCreateAuthor.js](src/domains/library/hooks/useCreateAuthor.js), [useCreateSeries.js](src/domains/library/hooks/useCreateSeries.js), [LibraryContext.jsx](src/domains/library/context/LibraryContext.jsx)
      Problem: Creating an author/series never invalidates `["authors"]`/`["series"]`. `customAuthors`/`customSeries` local context state is a workaround that's lost on refresh and can diverge from what the server actually stored.
      Fix: Add `onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authors"] })` (same for series); remove the parallel `customAuthors`/`customSeries` state.

- [x] **4. Timezone-unsafe date parsing in Metrics**
      Files: [Metrics.jsx](src/domains/library/pages/Metrics.jsx), [BooksPerYearDetails.jsx](src/domains/library/components/metrics/BooksPerYearDetails.jsx) vs. [dateUtils.js](src/domains/library/utils/dateUtils.js)
      Problem: Year/month bucketing uses raw `new Date(b.endDate).getFullYear()/.getMonth()` instead of the existing timezone-safe `parseLocalDate`. A `"YYYY-MM-DD"` string parses as UTC midnight; calling local-timezone getters on it can shift dates across month/year boundaries for users west of UTC.
      Fix: Use `parseLocalDate` everywhere a date string is parsed for grouping/diffing.

- [x] **5. Router has no `/` or catch-all route**
      File: [src/router.jsx](src/router.jsx)
      Problem: Only `/library/inventory`, `/library/metrics`, `/library/randomize` are registered. Visiting `/` or any invalid URL hits react-router's default unstyled error boundary.
      Fix: Add an index redirect (`/` → `/library/inventory`) and a `*` catch-all route with a friendly not-found page.

- [x] **6. `isSpinning` gets stuck `true` after mid-roll category switch**
      File: [src/domains/library/pages/Randomize.jsx](src/domains/library/pages/Randomize.jsx)
      Problem: The `useEffect` on `[category]` clears the pending roll `setTimeout` but never resets `isSpinning` back to `false`. Switching category tabs during the 300ms roll animation leaves the selector stuck dimmed/disabled.
      Fix: Call `setIsSpinning(false)` alongside clearing the timeout in that effect.

- [x] **7. ISBN required-vs-optional contradiction**
      File: [src/domains/library/components/AddBookForm.jsx](src/domains/library/components/AddBookForm.jsx)
      Problem: The ISBN field's placeholder says "ISBN (optional)", but `handleAddBook` validation requires `newBook.isbn13.trim()` and blocks saving without it.
      Fix: ISBN13 is required by product decision — updated the placeholder to "ISBN \*" to match the existing validation instead of relaxing it.

- [x] **8. `QueryClient` created inside `App`'s render body**
      File: [src/App.jsx](src/App.jsx)
      Problem: `const queryClient = new QueryClient();` is created in the component function body, not hoisted/memoized. If `App` ever re-renders, the entire React Query cache is destroyed and recreated.
      Fix: Hoist `new QueryClient()` outside the component, or use `useState(() => new QueryClient())`.

---

## HIGH

- [x] **9. `selectedBook` context snapshot duplicates the `books` query cache**
      Files: [LibraryContext.jsx](src/domains/library/context/LibraryContext.jsx), [EditBookForm.jsx](src/domains/library/components/EditBookForm.jsx)
      Problem: `selectedBook` is a manually-managed spread-copy, edited directly in context state, never reconciled with the `books` cache after a mutation succeeds (the API returns `"Success"`, not the updated entity).
      Fix: Derive the displayed book from the (invalidated/refetched) `books` array by id, or have the API return the updated resource and seed context state from it.

- [x] **10. Mutating buttons aren't disabled while pending**
      Files: [AddBookForm.jsx](src/domains/library/components/AddBookForm.jsx), [EditBookForm.jsx](src/domains/library/components/EditBookForm.jsx), [RandomSelector.jsx](src/domains/library/components/randomize/RandomSelector.jsx), [SearchableDropdown.jsx](src/domains/library/components/SearchableDropdown.jsx)
      Problem: Only the Delete button in `BookDetailModal` disables itself via `isPending`. Save/Add/Start-Reading/Add-author-or-series buttons don't — double-clicks or slow networks can trigger duplicate requests.
      Fix: Disable the triggering button/form while `mutation.isPending`, consistent with the Delete button pattern.

- [x] **11. Inconsistent validation between Add and Edit book flows**
      Files: [AddBookForm.jsx](src/domains/library/components/AddBookForm.jsx), [EditBookForm.jsx](src/domains/library/components/EditBookForm.jsx)
      Problem: AddBookForm requires `pages > 0` and non-empty ISBN; EditBookForm validates neither. A book can be created under strict rules then edited into an invalid state.
      Fix: Share one validation function/schema between both forms.

- [x] **12. Inconsistent null-guarding on `pages` sums**
      Files: [Metrics.jsx](src/domains/library/pages/Metrics.jsx), [AuthorDetailModal.jsx](src/domains/library/components/AuthorDetailModal.jsx) vs. [RandomSelector.jsx](src/domains/library/components/randomize/RandomSelector.jsx)
      Problem: Page totals are summed as `s + b.pages` with no null guard in some places, while `RandomSelector` defensively uses `(book.pages || 0)`. Since `pages` is nullable at the API layer, one book without a page count turns every downstream sum/average into `NaN`.
      Fix: Guard with `b.pages || 0` consistently everywhere pages are summed.

- [x] **13. Duplicated "start reading" mutation logic in 3 places**
      Files: [Randomize.jsx](src/domains/library/pages/Randomize.jsx) `handleStartReading`, [CurrentlyReading.jsx](src/domains/library/components/metrics/CurrentlyReading.jsx), [StartReadingModal.jsx](src/domains/library/components/metrics/StartReadingModal.jsx)
      Problem: The same payload shape (`status`, `startDate`, `endDate: null`, `currentPage: 0`) and toast wording is duplicated independently in three call sites, already drifted slightly.
      Fix: Not urgent; consider a shared `useStartReading()` hook if touched again.

- [x] **14. No error boundaries anywhere**
      File: whole app (no `errorElement` in [router.jsx](src/router.jsx), no top-level boundary in [App.jsx](src/App.jsx))
      Problem: Any render-time exception blanks the entire app via react-router's default error element.
      Fix: Add a top-level error boundary and/or per-route `errorElement` with a recoverable error UI.

---

## MEDIUM

- [x] **15. Variable shadowing of `author`/`books` in Inventory.jsx**
      File: [src/domains/library/pages/Inventory.jsx](src/domains/library/pages/Inventory.jsx)
      Problem: Context's `author` is shadowed inside `.filter()`, and shadowed again (along with `books`) inside `.map(([author, books]) => ...)`.
      Fix: Rename inner locals (e.g. `authorName`, `groupBooks`).

- [x] **16. Misleading `!eligibleCount > 0` expression**
      File: [src/domains/library/pages/Randomize.jsx](src/domains/library/pages/Randomize.jsx)
      Problem: Works today by coincidence of operator precedence but is a landmine for future edits.
      Fix: Replace with `eligibleCount === 0`.

- [x] **17. Unnecessary `setTimeout(0)` to reset `pick`**
      File: [src/domains/library/pages/Randomize.jsx](src/domains/library/pages/Randomize.jsx)
      Problem: Category-change effect resets `pick` via `setTimeout(() => setPick(null), 0)` instead of calling it synchronously.
      Fix: Simplified the effect; the `setState` calls are still deferred via `queueMicrotask` (not a 300ms-style timeout) because the project's `eslint-plugin-react-hooks` rules disallow calling `setState` directly in an effect body.

- [x] **18. Duplicated modal shell markup**
      Files: [BookDetailModal.jsx](src/domains/library/components/BookDetailModal.jsx), [AuthorDetailModal.jsx](src/domains/library/components/AuthorDetailModal.jsx), [StartReadingModal.jsx](src/domains/library/components/metrics/StartReadingModal.jsx)
      Problem: Near-identical fixed-overlay/sticky-header/panel markup duplicated three times.
      Fix: Extracted a shared [Modal.jsx](src/domains/library/components/Modal.jsx) shell (overlay + close-on-outside-click + panel) used by all three.

- [x] **19. Unmemoized `LibraryContext` provider value**
      File: [LibraryContext.jsx](src/domains/library/context/LibraryContext.jsx)
      Problem: New value object every render → all consumers re-render on any context state change. Likely low impact at current app scale.
      Fix: Wrapped the provider value in `useMemo`.

- [x] **20. Query keys hardcoded as repeated string literals**
      Files: [useBooks.js](src/domains/library/hooks/useBooks.js), [useAddBook.js](src/domains/library/hooks/useAddBook.js), [useUpdateBook.js](src/domains/library/hooks/useUpdateBook.js), [useDeleteBook.js](src/domains/library/hooks/useDeleteBook.js)
      Fix: Centralized as `BOOKS_KEY`/`AUTHORS_KEY`/`SERIES_KEY` in [queryKeys.js](src/domains/library/hooks/queryKeys.js), used by all query/mutation hooks.

- [x] **21. Pages input forces `0` immediately on clear**
      File: [EditBookForm.jsx](src/domains/library/components/EditBookForm.jsx)
      Problem: `onChange` does `Number(e.target.value) || 0`, forcing pages to `0` the instant the field is cleared, before retyping.
      Fix: `pages` is now kept as a raw string in the draft; it's only coerced to a `Number` when building the save payload.

- [x] **22. `deleteBook` defensively unwraps object-or-id**
      File: [src/domains/library/api.js](src/domains/library/api.js)
      Problem: `typeof id === "object" ? id.id : id` masks an unclear calling contract rather than fixing call sites.
      Fix: Confirmed the only call site already passes `selectedBook.id`; dropped the duck-typing in `deleteBook`.

- [x] **23. No modal accessibility affordances**
      Files: all modal components
      Problem: No ESC-to-close, no focus trap/return-focus behavior.
      Fix: Added ESC-to-close, a basic focus trap, and return-focus-on-close to the shared [Modal.jsx](src/domains/library/components/Modal.jsx).

---

## LOW

- [x] **24. Dead legacy `BookInventory.jsx` at repo root**
      File: `BookInventory.jsx`
      Problem: Not imported anywhere; uses an older data shape (`book.series`, lowercase `status: 'unread'`) that contradicts the current API contract.
      Fix: Deleted.

- [x] **25. Commented-out Google Books fetch code**
      File: [src/domains/library/components/BookCover.jsx](src/domains/library/components/BookCover.jsx)
      Fix: Removed the ~25-line commented block.

- [x] **26. Inconsistent hook file-name vs export-name convention**
      Files: [useBooks.js](src/domains/library/hooks/useBooks.js), [useAuthors.js](src/domains/library/hooks/useAuthors.js), [useSeries.js](src/domains/library/hooks/useSeries.js)
      Fix: Renamed `useGetBooks.js`/`useGetAuthors.js`/`useGetSeries.js` to match their exported hook names; updated all import sites.

- [x] **27. Redundant optional-chaining given default `[]`**
      File: [src/domains/library/pages/Inventory.jsx](src/domains/library/pages/Inventory.jsx)
      Problem: `books?.filter`/`filteredBooks &&` checks are redundant since `useBooks()`'s `data: books = []` default already guarantees an array.
      Fix: Removed the redundant `?.`/`&&` guards.

- [x] **28. `let filteredBooks` never reassigned**
      File: [src/domains/library/pages/Inventory.jsx](src/domains/library/pages/Inventory.jsx)
      Fix: Changed to `const`.

- [x] **29. `useBooks` uniquely disables `refetchOnMount`**
      File: [useBooks.js](src/domains/library/hooks/useBooks.js) vs. [useAuthors.js](src/domains/library/hooks/useAuthors.js)/[useSeries.js](src/domains/library/hooks/useSeries.js)
      Problem: Undocumented inconsistency; looks unintentional.
      Fix: Removed `refetchOnMount: false` from `useBooks` to align with the other query hooks.

- [ ] **30. No automated tests**
      Problem: No tests anywhere despite extractable pure logic (Metrics aggregation, Randomize pooling/categorization) that would be cheap to unit test.

---

## Refactoring plan

### 1. Fix immediately

- [x] #5 Add `/` redirect + catch-all route
- [x] #8 Hoist `QueryClient` out of `App`
- [x] #7 Fix ISBN required/optional contradiction
- [x] #6 Reset `isSpinning` on category change
- [x] #1 Guard the rating rollback race

### 2. Fix soon

- [x] #3 Invalidate `authors`/`series` queries on create; remove `customAuthors`/`customSeries`
- [x] #4 Route all date grouping/diffing through `parseLocalDate`
- [x] #10 Disable mutating buttons while `isPending`
- [x] #2 Surface query loading/error states (Inventory, Metrics at minimum)
- [x] #11 Unify pages/ISBN validation between Add and Edit forms
- [x] #12 Guard nullable `pages` consistently in all sums

### 3. Nice-to-have cleanup

- [x] #24 Remove root `BookInventory.jsx`
- [x] #25 Remove commented-out block in `BookCover.jsx`
- [x] #15 Rename shadowed variables in `Inventory.jsx`
- [x] #16 Simplify `!eligibleCount > 0`
- [x] #17 Simplify `setTimeout(0)` pick-reset
- [x] #18 Optional shared `Modal` shell component
- [x] #20 Centralize query key constants
- [ ] #30 Add unit tests for Metrics/Randomize pure logic — skipped (not needed)

---

## Do-not-change list (already well-designed)

- Domain-based folder layout (`api` / `hooks` / `pages` / `components` / `context` per domain).
- Centralizing all `fetch` calls in `api.js` — no component talks to the network directly.
- One-hook-per-query/mutation pattern with React Query.
- `ToastContext` — small, focused, not over-engineered.
- `dateUtils.parseLocalDate`/`formatDate` themselves are correctly written (the problem is inconsistent usage, not the utility).
- `StarRating`, `BookCover`, `SearchableDropdown` — small, single-responsibility, reusable components.
- Nested layout route (`AppLayout` + `Outlet`) for tab navigation — standard, correct react-router usage.
- Consistent Tailwind styling conventions throughout.
