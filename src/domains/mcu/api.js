import { requestJson, requestVoid } from "../../lib/http";

export function getMcuTracker() {
  return requestJson("/api/mcu/tracker", {
    errorMessage: "Failed to fetch MCU tracker data",
  });
}

export async function updateContentStatus({ globalId, status }) {
  await requestVoid(`/api/mcu/tracker/${encodeURIComponent(globalId)}/status`, {
    method: "PUT",
    body: { status },
    errorMessage: "Failed to update content status",
    includeErrorDetail: true,
  });
  return "Success";
}

// ── Create / edit / delete ────────────────────────────────────────────────

const MCU = "/api/mcu";

const write = (method, path, body, errorMessage) =>
  (method === "DELETE" ? requestVoid : requestJson)(`${MCU}${path}`, {
    method,
    body,
    errorMessage,
    includeErrorDetail: true,
  });

export const createMovie = (body) =>
  write("POST", "/movies", body, "Failed to add movie");
export const updateMovie = (id, body) =>
  write("PUT", `/movies/${id}`, body, "Failed to update movie");
export const deleteMovie = (id) =>
  write("DELETE", `/movies/${id}`, undefined, "Failed to delete movie");

export const createShowSeason = (body) =>
  write("POST", "/shows", body, "Failed to add season");
export const updateShowSeason = (id, body) =>
  write("PUT", `/shows/${id}`, body, "Failed to update season");
export const deleteShowSeason = (id) =>
  write("DELETE", `/shows/${id}`, undefined, "Failed to delete season");

export const createEpisode = (showId, body) =>
  write("POST", `/shows/${showId}/episodes`, body, "Failed to add episode");
export const updateEpisode = (id, body) =>
  write("PUT", `/episodes/${id}`, body, "Failed to update episode");
export const deleteEpisode = (id) =>
  write("DELETE", `/episodes/${id}`, undefined, "Failed to delete episode");

/** Step 1 of a poster upload (same flow as Library covers). */
export function getPosterUploadUrl(fileName, fileType) {
  const params = new URLSearchParams({ fileName, fileType });
  return requestJson(`${MCU}/poster-upload-url?${params}`, {
    errorMessage: "Failed to get upload URL",
    includeErrorDetail: true,
  });
}

/** Step 3: point a movie ("movie") or season ("show") at the uploaded image. */
export function attachPoster(kind, id, s3Key) {
  return requestJson(
    `${MCU}/${kind === "show" ? "shows" : "movies"}/${id}/poster`,
    {
      method: "POST",
      body: { s3Key },
      errorMessage: "Failed to attach poster",
      includeErrorDetail: true,
    },
  );
}
