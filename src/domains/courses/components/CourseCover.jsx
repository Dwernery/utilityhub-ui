import { GraduationCap } from "lucide-react";

/** A course's cover image, or a placeholder. Size it with className. */
export function CourseCover({ course, className = "" }) {
  if (course.s3Url) {
    return (
      <img
        src={course.s3Url}
        alt=""
        className={`object-cover ${className}`}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={`bg-gradient-to-br from-indigo-100 to-slate-200 flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <GraduationCap className="w-1/2 h-1/2 max-w-6 max-h-6 text-indigo-300" />
    </div>
  );
}
