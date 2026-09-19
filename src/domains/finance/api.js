import { API_URL } from "../../config";

export async function getNetWorthHistory() {
  const response = await fetch(`${API_URL}/api/finance/net-worth-history`);

  if (!response.ok) {
    throw new Error("Failed to fetch net worth history");
  }

  return response.json();
}