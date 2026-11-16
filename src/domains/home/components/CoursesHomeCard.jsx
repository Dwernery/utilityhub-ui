import { BookOpen } from "lucide-react";
import { UtilityCard } from "./UtilityCard";

// Not a link: there's no /courses page yet (mobile does the same).
export function CoursesHomeCard() {
  return (
    <UtilityCard icon={BookOpen} title="Courses">
      <div className="mt-3 space-y-3">
        <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center">
          <p className="text-sm text-slate-400">Course data coming soon</p>
        </div>
      </div>
    </UtilityCard>
  );
}
