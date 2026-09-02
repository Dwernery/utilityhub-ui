import { API_URL } from "../../config";

export async function getMcuTracker() {
  const response = await fetch(`${API_URL}/api/mcu/tracker`);

  if (!response.ok) {
    throw new Error("Failed to fetch MCU tracker data");
  }

  return response.json();
}

export async function updateContentStatus({ globalId, status }) {
  const response = await fetch(`${API_URL}/api/mcu/tracker/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      globalId,
      status,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update content status (status ${response.status}): ${errorText || "Unknown error"}`,
    );
  }

  return "Success";
}
