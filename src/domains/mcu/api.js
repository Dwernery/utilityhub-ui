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
