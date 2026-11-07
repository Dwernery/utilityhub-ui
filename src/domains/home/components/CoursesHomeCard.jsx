import { BookOpen } from "lucide-react";
import { UtilityCard } from "./UtilityCard";

export function CoursesHomeCard() {
  return (
    <UtilityCard icon={BookOpen} title="Courses" to="/courses">
      <div className="mt-3 space-y-3">
        <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center">
          <p className="text-sm text-slate-400">Course data coming soon</p>
        </div>
      </div>
    </UtilityCard>
  );
}
