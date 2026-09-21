import { API_URL } from "../../config";

export async function getNetWorthHistory() {
  const response = await fetch(`${API_URL}/api/finance/net-worth-history`);

  if (!response.ok) {
    throw new Error("Failed to fetch net worth history");
  }

  return response.json();
}

export async function updateAccountBalance(accountId, balanceDate, balance) {
  const response = await fetch(`${API_URL}/api/finance/account-balance`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accountId,
      balanceDate,
      balance,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update account balance (status ${response.status}): ${errorText || "Unknown error"}`,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return { success: true };
}
