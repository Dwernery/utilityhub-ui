import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Trash2, X } from "lucide-react";
import { Modal } from "../../../components/Modal";
import { SearchableDropdown } from "../../library/components/SearchableDropdown";
import { useToast } from "../../../context/ToastContext";
import {
  COVER_TYPES,
  coverFileError,
  useAddCourse,
  useCreateCreator,
  useCreators,
  useDeleteCourse,
  useGroups,
  useUpdateCourse,
  useUploadCover,
} from "../hooks";
import { CourseCover } from "./CourseCover";
import { courseFormError } from "../utils/courseForm";

const inputClass =
  "w-full px-3 py-2 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:opacity-60";

const wholeNumber = (text) => text.replace(/[^0-9]/g, "").slice(0, 5);

/**
 * Add a course (course = null) or edit one. Covers upload after the course is saved,
 * since the API needs the course's id to store one.
 */
export function CourseFormModal({ course, defaultGroupId = null, onClose }) {
  const editing = Boolean(course);
  const [form, setForm] = useState(() => ({
    title: course?.title ?? "",
    creatorName: course?.creatorName ?? "",
    groupId: course ? (course.groupId ?? "") : (defaultGroupId ?? ""),
    totalLessons: course ? String(course.totalLessons) : "",
    completedLessons: course ? String(course.completedLessons) : "",
    url: course?.url ?? "",
  }));
  const [coverFile, setCoverFile] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const fileInput = useRef(null);

  const { data: creators = [] } = useCreators();
  const { data: groups = [] } = useGroups();
  const createCreator = useCreateCreator();
  const addCourse = useAddCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const uploadCover = useUploadCover();
  const addToast = useToast();

  const creatorOptions = useMemo(() => creators.map((c) => c.name), [creators]);
  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.position - b.position),
    [groups],
  );
  const previewUrl = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile],
  );
  useEffect(
    () => () => previewUrl && URL.revokeObjectURL(previewUrl),
    [previewUrl],
  );

  const busy =
    addCourse.isPending ||
    updateCourse.isPending ||
    deleteCourse.isPending ||
    uploadCover.isPending ||
    createCreator.isPending;
  const error = courseFormError(form);
  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const pickCover = (file) => {
    if (!file) return;
    const problem = coverFileError(file);
    if (problem) {
      addToast(problem, "error");
      return;
    }
    setCoverFile(file);
  };

  const save = async () => {
    if (error) {
      setShowErrors(true);
      return;
    }
    const body = {
      title: form.title.trim(),
      creatorName: form.creatorName.trim(),
      groupId: form.groupId === "" ? null : Number(form.groupId),
      totalLessons: Number(form.totalLessons),
      completedLessons:
        form.completedLessons === "" ? 0 : Number(form.completedLessons),
      url: form.url.trim() || null,
    };
    let saved;
    try {
      saved = editing
        ? await updateCourse.mutateAsync({ id: course.id, ...body })
        : await addCourse.mutateAsync(body);
    } catch (err) {
      addToast(err?.message || "Couldn't save the course", "error");
      return;
    }
    if (coverFile) {
      try {
        await uploadCover.mutateAsync({ courseId: saved.id, file: coverFile });
      } catch (err) {
        addToast(
          `Course saved, but the cover didn't upload: ${err?.message || "unknown error"}`,
          "warning",
        );
        onClose();
        return;
      }
    }
    addToast(`${editing ? "Saved" : "Added"} "${body.title}"`, "success");
    onClose();
  };

  const remove = () => {
    if (!window.confirm(`Delete "${course.title}"? This can't be undone.`))
      return;
    deleteCourse.mutate(course.id, {
      onSuccess: () => {
        addToast(`Deleted "${course.title}"`, "success");
        onClose();
      },
      onError: (err) =>
        addToast(err?.message || "Couldn't delete the course", "error"),
    });
  };

  const coverPreview = previewUrl
    ? { s3Url: previewUrl }
    : { s3Url: course?.s3Url ?? null };

  return (
    <Modal
      onClose={busy ? () => {} : onClose}
      panelClassName="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 shadow-2xl"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-lg">
            {editing ? "Edit Course" : "Add Course"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <Field label="Title *">
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title")(e.target.value)}
              disabled={busy}
              maxLength={255}
              className={inputClass}
            />
          </Field>

          <Field label="Creator *" plain>
            <SearchableDropdown
              value={form.creatorName}
              onChange={set("creatorName")}
              options={creatorOptions}
              placeholder="Choose or add a creator"
              disabled={busy}
              isAddingNew={createCreator.isPending}
              addNewLabel="Add creator"
              onAddNew={(name) =>
                createCreator.mutate(name, {
                  onSuccess: (creator) => {
                    set("creatorName")(creator.name);
                    addToast(`Creator "${creator.name}" added`, "success");
                  },
                  onError: (err) => {
                    set("creatorName")("");
                    addToast(
                      err?.message || "Couldn't add the creator",
                      "error",
                    );
                  },
                })
              }
            />
          </Field>

          <Field label="Group">
            <select
              value={form.groupId}
              onChange={(e) => set("groupId")(e.target.value)}
              disabled={busy}
              className={`${inputClass} bg-white`}
            >
              <option value="">No group</option>
              {sortedGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Lessons *">
              <input
                type="text"
                inputMode="numeric"
                value={form.totalLessons}
                onChange={(e) =>
                  set("totalLessons")(wholeNumber(e.target.value))
                }
                disabled={busy}
                className={inputClass}
              />
            </Field>
            <Field label="Lessons done">
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={form.completedLessons}
                onChange={(e) =>
                  set("completedLessons")(wholeNumber(e.target.value))
                }
                disabled={busy}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Link">
            <input
              type="url"
              placeholder="https://"
              value={form.url}
              onChange={(e) => set("url")(e.target.value)}
              disabled={busy}
              maxLength={2048}
              className={inputClass}
            />
          </Field>

          <Field label="Cover" plain>
            <div className="flex items-center gap-3">
              <CourseCover
                course={coverPreview}
                className="w-32 h-[4.5rem] rounded-lg ring-1 ring-slate-200 flex-shrink-0"
              />
              <div className="flex flex-col items-start gap-1">
                <input
                  ref={fileInput}
                  type="file"
                  accept={COVER_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => {
                    pickCover(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 cursor-pointer disabled:opacity-60"
                >
                  <ImagePlus className="w-4 h-4" />
                  {coverPreview.s3Url ? "Change image" : "Choose image"}
                </button>
                {coverFile && (
                  <button
                    type="button"
                    onClick={() => setCoverFile(null)}
                    disabled={busy}
                    className="px-3 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Keep {course?.s3Url ? "current image" : "no image"}
                  </button>
                )}
              </div>
            </div>
          </Field>

          {showErrors && error && (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-3 flex items-center gap-2">
          {editing && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 cursor-pointer disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer disabled:opacity-60"
            >
              {uploadCover.isPending
                ? "Uploading cover…"
                : addCourse.isPending || updateCourse.isPending
                  ? "Saving…"
                  : "Save"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

/** A labelled field. `plain` for controls that aren't a single input (a label would steal their clicks). */
function Field({ label, plain = false, children }) {
  const Root = plain ? "div" : "label";
  return (
    <Root className="block">
      <span className="block text-xs font-semibold text-slate-500 mb-1">
        {label}
      </span>
      {children}
    </Root>
  );
}
