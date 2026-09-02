import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateContentStatus } from "../api.js";
import { MCU_TRACKER_KEY } from "./queryKeys.js";

export function useUpdateContentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContentStatus,
    onSuccess: (_, variables) => {
      // Instead of invalidating entire cache, use setQueryData to update
      // the specific item that changed. This avoids refetching all data.
      queryClient.setQueryData(MCU_TRACKER_KEY, (oldData) => {
        if (!oldData?.domains) return oldData;

        const newData = { ...oldData };
        const { globalId, status } = variables;

        // Update all domains to find and update the item with matching globalId
        newData.domains = oldData.domains.map((domain) => ({
          ...domain,
          movies: domain.movies?.map((movie) =>
            movie.globalId === globalId ? { ...movie, status } : movie,
          ),
          shows: domain.shows?.map((show) => ({
            ...show,
            seasons: show.seasons?.map((season) => ({
              ...season,
              episodes: season.episodes?.map((episode) =>
                episode.globalId === globalId
                  ? { ...episode, status }
                  : episode,
              ),
            })),
          })),
        }));

        return newData;
      });
    },
  });
}
