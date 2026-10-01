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

export async function getAccounts() {
  const response = await fetch(`${API_URL}/api/finance/accounts`);

  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }

  return response.json();
}

export async function createAccount(accountName, accountType, category) {
  const response = await fetch(`${API_URL}/api/finance/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accountName,
      accountType,
      category,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create account (status ${response.status}): ${errorText || "Unknown error"}`,
    );
  }

  return response.json();
}

export async function deleteAccountBalance(accountId, balanceDate) {
  const response = await fetch(`${API_URL}/api/finance/account-balance`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accountId,
      balanceDate,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete account balance (status ${response.status}): ${errorText || "Unknown error"}`,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return { success: true };
}

export async function getTransactions() {
  const response = await fetch(`${API_URL}/api/finance/transactions`);

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}

export async function updateTransaction(id, name, amount, paid) {
  const response = await fetch(`${API_URL}/api/finance/transactions`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      name,
      amount,
      paid,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update transaction (status ${response.status}): ${errorText || "Unknown error"}`,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return { success: true };
}

export async function clearAllPaid() {
  const response = await fetch(
    `${API_URL}/api/finance/transactions/clear-paid`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to clear paid status (status ${response.status}): ${errorText || "Unknown error"}`,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return { success: true };
}
