/**
 * Course and group stats, worked out from the course list so they're never stale.
 * Mirrors utility-hub-mobile's lib/courses/utils/stats.ts.
 */

/** "NOT_STARTED" | "IN_PROGRESS" | "DONE" */
export function courseStatus(course) {
  if (course.completedLessons >= course.totalLessons) return "DONE";
  return course.completedLessons > 0 ? "IN_PROGRESS" : "NOT_STARTED";
}

/** Whole-number percent, rounded down so 99.6% doesn't read as done. */
export function percent(completed, total) {
  if (!total) return 0;
  return Math.min(100, Math.max(0, Math.floor((completed / total) * 100)));
}

/** The smallest fill a bar shows once any lesson is done, so a little progress never looks like none. */
const MIN_VISIBLE = 0.02;

/** Fill for a bar (0–1). */
export function progressFraction(completed, total) {
  if (!total || completed <= 0) return 0;
  return Math.min(1, Math.max(completed / total, MIN_VISIBLE));
}

/** "41%", or "<1%" when some lessons are done but they round down to 0 (2 of 320). */
export function percentLabel(completed, total) {
  const pct = percent(completed, total);
  return pct === 0 && completed > 0 ? "<1%" : `${pct}%`;
}

/** Lessons and courses summed over a list of courses (a group, or everything). */
export function sumStats(courses) {
  const completedLessons = courses.reduce((s, c) => s + c.completedLessons, 0);
  const totalLessons = courses.reduce((s, c) => s + c.totalLessons, 0);
  return {
    completedLessons,
    totalLessons,
    pct: percent(completedLessons, totalLessons),
    courseCount: courses.length,
    coursesDone: courses.filter((c) => courseStatus(c) === "DONE").length,
    coursesInProgress: courses.filter((c) => courseStatus(c) === "IN_PROGRESS")
      .length,
    coursesNotStarted: courses.filter((c) => courseStatus(c) === "NOT_STARTED")
      .length,
  };
}

const STATUS_ORDER = { IN_PROGRESS: 0, NOT_STARTED: 1, DONE: 2 };

/** In progress first (furthest along first), then not started, then done; ties by title. */
export function sortCourses(courses) {
  return [...courses].sort(
    (a, b) =>
      STATUS_ORDER[courseStatus(a)] - STATUS_ORDER[courseStatus(b)] ||
      percent(b.completedLessons, b.totalLessons) -
        percent(a.completedLessons, a.totalLessons) ||
      a.title.localeCompare(b.title),
  );
}

/** Title or creator contains the query, ignoring case. An empty query matches everything. */
export function matchesSearch(course, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    course.title.toLowerCase().includes(q) ||
    course.creatorName.toLowerCase().includes(q)
  );
}

/**
 * The page's sections: each group in its order, then "Ungrouped" (group: null).
 * Each has its sorted courses and their summed stats. Empty groups are kept so you
 * can add to them; "Ungrouped" only appears when it has courses.
 */
export function courseSections(courses, groups) {
  const byGroup = new Map(groups.map((g) => [g.id, []]));
  const ungrouped = [];
  for (const course of courses) {
    (byGroup.get(course.groupId) ?? ungrouped).push(course);
  }
  const sections = [...groups]
    .sort((a, b) => a.position - b.position || a.id - b.id)
    .map((group) => {
      const list = byGroup.get(group.id);
      return { group, courses: sortCourses(list), stats: sumStats(list) };
    });
  if (ungrouped.length > 0) {
    sections.push({
      group: null,
      courses: sortCourses(ungrouped),
      stats: sumStats(ungrouped),
    });
  }
  return sections;
}

/** For the Home tile: overall totals and the in-progress courses, furthest along first. */
export function coursesHomeStats(courses) {
  return {
    overall: sumStats(courses),
    inProgress: sortCourses(
      courses.filter((c) => courseStatus(c) === "IN_PROGRESS"),
    ),
  };
}

/** Each course's place in the list, so the order can be held still while you click −/+. */
export function courseOrder(sections) {
  const order = new Map();
  sections.forEach((s) =>
    s.courses.forEach((c) => order.set(c.id, order.size)),
  );
  return order;
}

/**
 * Puts each section's courses back in a remembered order, so a row doesn't move under your
 * pointer when its progress changes. Courses added since go after the rest, in the usual order.
 */
export function holdOrder(sections, order) {
  const at = (c) => order.get(c.id) ?? Number.MAX_SAFE_INTEGER;
  return sections.map((s) => ({
    ...s,
    courses: [...s.courses].sort((a, b) => at(a) - at(b)),
  }));
}
