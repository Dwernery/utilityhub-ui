import { useMemo, useState } from "react";
import { Folders, GraduationCap, Plus, Search, Users, X } from "lucide-react";
import { LoadError } from "../../../components/LoadError";
import { LoadingState } from "../../../components/LoadingState";
import { useToast } from "../../../context/ToastContext";
import { useCourses, useGroups, useSetProgress } from "../hooks";
import {
  courseOrder,
  courseSections,
  holdOrder,
  matchesSearch,
} from "../utils/stats";
import { GroupSection } from "../components/GroupSection";
import { CourseFormModal } from "../components/CourseFormModal";
import { GroupsModal } from "../components/GroupsModal";
import { CreatorsModal } from "../components/CreatorsModal";

const sectionKey = (section) => section.group?.id ?? "ungrouped";

export function Courses() {
  const courses = useCourses();
  const groups = useGroups();
  const setProgress = useSetProgress();
  const addToast = useToast();

  const [search, setSearch] = useState("");
  // { course: null | course, groupId } while the course form is open
  const [courseForm, setCourseForm] = useState(null);
  const [showGroups, setShowGroups] = useState(false);
  // Which groups are open. Decided once, when the data first arrives: groups with a
  // course in progress start open. After that only your clicks change it, so a group
  // never snaps shut under you (say, when you finish its last course in progress).
  const [openKeys, setOpenKeys] = useState(null);
  const [showCreators, setShowCreators] = useState(false);

  // The order courses were in when the page loaded. Held while you click −/+, so a row
  // doesn't jump (a course you start would otherwise move up to the in-progress ones).
  const [heldOrder, setHeldOrder] = useState(null);
  const sortedSections = useMemo(
    () => courseSections(courses.data ?? [], groups.data ?? []),
    [courses.data, groups.data],
  );
  const allSections = useMemo(
    () => (heldOrder ? holdOrder(sortedSections, heldOrder) : sortedSections),
    [sortedSections, heldOrder],
  );
  if (heldOrder === null && courses.data && groups.data) {
    setHeldOrder(courseOrder(sortedSections));
  }
  const searching = search.trim() !== "";
  const sections = useMemo(() => {
    if (!searching) return allSections;
    return allSections
      .map((s) => ({
        ...s,
        courses: s.courses.filter((c) => matchesSearch(c, search)),
      }))
      .filter((s) => s.courses.length > 0);
  }, [allSections, search, searching]);
  const groupOrder = allSections.filter((s) => s.group).map((s) => s.group.id);

  if (openKeys === null && courses.data && groups.data) {
    setOpenKeys(
      new Map(
        sortedSections.map((s) => [
          sectionKey(s),
          s.stats.coursesInProgress > 0,
        ]),
      ),
    );
  }
  // Searching opens every group with a match; your choices come back after.
  // A group made after the page loaded starts open, so you see what you add to it.
  const isOpen = (section) =>
    searching || (openKeys?.get(sectionKey(section)) ?? true);
  const toggle = (section) =>
    setOpenKeys((keys) => {
      const next = new Map(keys);
      next.set(sectionKey(section), !isOpen(section));
      return next;
    });

  if (courses.isPending || groups.isPending) {
    return <LoadingState what="courses" />;
  }
  const failed = courses.isLoadingError
    ? courses
    : groups.isLoadingError
      ? groups
      : null;
  if (failed) {
    return (
      <LoadError
        what="courses"
        error={failed.error}
        onRetry={() => {
          courses.refetch();
          groups.refetch();
        }}
        retrying={courses.isFetching || groups.isFetching}
      />
    );
  }

  const step = (course, delta) => {
    const next = Math.min(
      course.totalLessons,
      Math.max(0, course.completedLessons + delta),
    );
    if (next === course.completedLessons) return;
    setProgress.mutate(
      { id: course.id, completedLessons: next },
      {
        onSuccess: () => {
          if (next === course.totalLessons) {
            addToast(`Finished "${course.title}"`, "success");
          }
        },
        onError: (err) =>
          addToast(err?.message || "Couldn't save progress", "error"),
      },
    );
  };

  const nothingYet =
    (courses.data ?? []).length === 0 && groupOrder.length === 0;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-slate-200 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search title or creator…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setSearch("")}
            aria-label="Search courses"
            className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowCreators(true)}
          className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          title="Rename or delete creators"
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Creators</span>
        </button>
        <button
          type="button"
          onClick={() => setShowGroups(true)}
          title="Add, rename, reorder or delete groups"
          className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
        >
          <Folders className="w-4 h-4" />
          <span className="hidden sm:inline">Groups</span>
        </button>
        <button
          type="button"
          onClick={() => setCourseForm({ course: null, groupId: null })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 text-sm font-medium cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Course</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {nothingYet ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-14 px-4 text-center">
          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="mt-2 text-sm font-semibold text-slate-700">
            No courses yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Add a course to start tracking lessons. Groups are optional.
          </p>
        </div>
      ) : sections.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-10">
          No courses match “{search.trim()}”.
        </p>
      ) : (
        // Groups stack in one column, in your order, so closed groups line up as tidy
        // bars; an open group's courses go two across on wide screens (GroupSection).
        <div className="space-y-4">
          {sections.map((section) => (
            <GroupSection
              key={sectionKey(section)}
              section={section}
              open={isOpen(section)}
              onToggle={() => toggle(section)}
              searching={searching}
              onStep={step}
              onEditCourse={(course) => setCourseForm({ course })}
              onAddCourse={(groupId) =>
                setCourseForm({ course: null, groupId })
              }
            />
          ))}
        </div>
      )}

      {courseForm && (
        <CourseFormModal
          course={courseForm.course}
          defaultGroupId={courseForm.groupId ?? null}
          onClose={() => setCourseForm(null)}
        />
      )}
      {showCreators && <CreatorsModal onClose={() => setShowCreators(false)} />}
      {showGroups && <GroupsModal onClose={() => setShowGroups(false)} />}
    </>
  );
}
