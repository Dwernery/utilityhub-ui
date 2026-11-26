import { requestJson, requestVoid } from "../../lib/http";

// Courses API. Mirrors utility-hub-mobile's lib/courses/api.ts.
const BASE = "/api/courses";

export function getCourses() {
  return requestJson(BASE, { errorMessage: "Failed to fetch courses" });
}

export function getCreators() {
  return requestJson(`${BASE}/creators`, {
    errorMessage: "Failed to fetch creators",
  });
}

export function getGroups() {
  return requestJson(`${BASE}/groups`, {
    errorMessage: "Failed to fetch groups",
  });
}

/** @param {{title, creatorName, groupId, totalLessons, completedLessons, url}} course */
export function addCourse(course) {
  return requestJson(BASE, {
    method: "POST",
    body: course,
    errorMessage: "Failed to add course",
    includeErrorDetail: true,
  });
}

export function updateCourse({ id, ...course }) {
  return requestJson(`${BASE}/${id}`, {
    method: "PUT",
    body: course,
    errorMessage: "Failed to save course",
    includeErrorDetail: true,
  });
}

export function setProgress({ id, completedLessons }) {
  return requestJson(`${BASE}/${id}/progress`, {
    method: "PATCH",
    body: { completedLessons },
    errorMessage: "Failed to save progress",
    includeErrorDetail: true,
  });
}

export async function deleteCourse(id) {
  await requestVoid(`${BASE}/${id}`, {
    method: "DELETE",
    errorMessage: "Failed to delete course",
  });
}

/** Returns the saved creator: an existing one if the name matches ignoring case. */
export function createCreator(name) {
  return requestJson(`${BASE}/creators`, {
    method: "POST",
    body: { name },
    errorMessage: "Failed to add creator",
    includeErrorDetail: true,
  });
}

export function renameCreator({ id, name }) {
  return requestJson(`${BASE}/creators/${id}`, {
    method: "PUT",
    body: { name },
    errorMessage: "Failed to rename creator",
    includeErrorDetail: true,
  });
}

/** Only a creator with no courses can be deleted. */
export async function deleteCreator(id) {
  await requestVoid(`${BASE}/creators/${id}`, {
    method: "DELETE",
    errorMessage: "Failed to delete creator",
    includeErrorDetail: true,
  });
}

/** Returns the saved group: an existing one if the name matches ignoring case. */
export function createGroup(name) {
  return requestJson(`${BASE}/groups`, {
    method: "POST",
    body: { name },
    errorMessage: "Failed to add group",
    includeErrorDetail: true,
  });
}

export function renameGroup({ id, name }) {
  return requestJson(`${BASE}/groups/${id}`, {
    method: "PUT",
    body: { name },
    errorMessage: "Failed to rename group",
    includeErrorDetail: true,
  });
}

/** @param {number[]} groupIds every group, in the new order */
export function reorderGroups(groupIds) {
  return requestJson(`${BASE}/groups/order`, {
    method: "PUT",
    body: { groupIds },
    errorMessage: "Failed to reorder groups",
    includeErrorDetail: true,
  });
}

export async function deleteGroup(id) {
  await requestVoid(`${BASE}/groups/${id}`, {
    method: "DELETE",
    errorMessage: "Failed to delete group",
  });
}

export function getCoverUploadUrl(id, fileType) {
  const params = new URLSearchParams({ fileType });
  return requestJson(`${BASE}/${id}/cover-upload-url?${params}`, {
    errorMessage: "Failed to start cover upload",
    includeErrorDetail: true,
  });
}

export function attachCover(id, s3Key) {
  return requestJson(`${BASE}/${id}/attach-cover`, {
    method: "POST",
    body: { s3Key },
    errorMessage: "Failed to attach cover",
    includeErrorDetail: true,
  });
}
