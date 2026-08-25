import { useUpdateBook } from "./useUpdateBook";
import { useToast } from "../../../context/ToastContext";

// Shared "start reading" mutation used by Randomize, StartReadingModal, and
// (indirectly) CurrentlyReading so the payload shape and toast copy can't
// drift out of sync between call sites.
export function useStartReading() {
  const updateBookMutation = useUpdateBook();
  const addToast = useToast();

  const startReading = (book, { onSuccess, onError } = {}) => {
    const startDate = new Date().toISOString().slice(0, 10);

    updateBookMutation.mutate(
      {
        id: book.id,
        status: "IN_PROGRESS",
        startDate,
        endDate: null,
        currentPage: 0,
      },
      {
        onSuccess: () => {
          addToast(`Started reading "${book.title}"`, "success");
          onSuccess?.();
        },
        onError: (err) => {
          addToast(
            `Failed to start reading: ${err?.message || "Unknown error"}`,
            "error",
          );
          onError?.(err);
        },
      },
    );
  };

  return { startReading, isPending: updateBookMutation.isPending };
}
