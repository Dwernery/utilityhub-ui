import { useUpdateContentStatus } from "./hooks";
import { useToast } from "../../context/ToastContext";
import { STATUS_LABELS } from "./utils/constants";

/**
 * Change the watch status of a movie, special or episode: PUT to the API, then
 * toast. On success the mutation patches the query cache, and everything that
 * reads it (including the derived `watched` map) updates from there.
 * Mirrors utility-hub-mobile's lib/mcu/useChangeStatus.ts.
 */
export function useChangeStatus() {
  const { mutate, isPending, variables } = useUpdateContentStatus();
  const addToast = useToast();

  const change = (globalId, status, { episode = false } = {}) =>
    mutate(
      { globalId, status },
      {
        onSuccess: () =>
          addToast(
            `${episode ? "Episode marked" : "Marked"} ${STATUS_LABELS[status]}`,
            "success",
          ),
        onError: () =>
          addToast(
            `Failed to update ${episode ? "episode " : ""}status. Please try again.`,
            "error",
          ),
      },
    );

  return {
    change,
    isPending,
    pendingId: isPending ? variables?.globalId : undefined,
  };
}
