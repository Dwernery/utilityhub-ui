import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import { getMcuTracker, updateContentStatus } from "./api";
import { parseGlobalId } from "./utils/editing";
import { uploadFileToS3, validateFile } from "../library/utils/s3Upload";
import { MCU_TRACKER_KEY } from "./queryKeys";

// MCU tracker query and mutation. Mirrors utility-hub-mobile's lib/mcu/hooks.ts.

export function useMcuTrackerData() {
  return useQuery({ queryKey: MCU_TRACKER_KEY, queryFn: getMcuTracker });
}

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

// ── Create / edit / delete ────────────────────────────────────────────────

/** Poster images only (the Library helper also allows PDFs and Word files). */
export const POSTER_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/** Presigned URL → S3 PUT → attach to the movie or season. */
async function uploadPoster(kind, id, file) {
  const check = validateFile(file, { allowedTypes: POSTER_TYPES });
  if (!check.valid) throw new Error(check.error);
  const { presignedUrl, s3Key } = await api.getPosterUploadUrl(
    file.name,
    file.type,
  );
  await uploadFileToS3(presignedUrl, file);
  await api.attachPoster(kind, id, s3Key);
}

/**
 * Add or edit a movie, special or show season, then upload its poster if one
 * was chosen. Resolves to { globalId, posterError } — a failed poster upload
 * doesn't undo the save, so it's reported separately (like Library covers).
 */
export function useSaveMcuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ kind, id, body, posterFile }) => {
      const isShow = kind === "show";
      const saved = id
        ? await (isShow
            ? api.updateShowSeason(id, body)
            : api.updateMovie(id, body))
        : await (isShow ? api.createShowSeason(body) : api.createMovie(body));
      let posterError = null;
      if (posterFile) {
        try {
          await uploadPoster(
            kind,
            parseGlobalId(saved.globalId).id,
            posterFile,
          );
        } catch (error) {
          posterError = error;
        }
      }
      return { globalId: saved.globalId, posterError };
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: MCU_TRACKER_KEY }),
  });
}

/** Delete a movie/special ("movie:12") or a whole season with its episodes ("show:3"). */
export function useDeleteMcuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (globalId) => {
      const { kind, id } = parseGlobalId(globalId);
      return kind === "show" ? api.deleteShowSeason(id) : api.deleteMovie(id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MCU_TRACKER_KEY }),
  });
}

/** Add (no `episodeId`) or edit an episode. */
export function useSaveEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ showId, episodeId, body }) =>
      episodeId
        ? api.updateEpisode(episodeId, body)
        : api.createEpisode(showId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MCU_TRACKER_KEY }),
  });
}

export function useDeleteEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (episodeId) => api.deleteEpisode(episodeId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MCU_TRACKER_KEY }),
  });
}
