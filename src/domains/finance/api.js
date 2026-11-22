import { requestJson, requestMaybeJson } from "../../lib/http";

const BASE = "/api/finance";

export function getNetWorthHistory() {
  return requestJson(`${BASE}/net-worth-history`, {
    errorMessage: "Failed to fetch net worth history",
  });
}

export function updateAccountBalance(accountId, balanceDate, balance) {
  return requestMaybeJson(
    `${BASE}/accounts/${accountId}/balances/${balanceDate}`,
    {
      method: "PUT",
      body: { balance },
      errorMessage: "Failed to update account balance",
      includeErrorDetail: true,
    },
  );
}

export function deleteAccountBalance(accountId, balanceDate) {
  return requestMaybeJson(
    `${BASE}/accounts/${accountId}/balances/${balanceDate}`,
    {
      method: "DELETE",
      errorMessage: "Failed to delete account balance",
      includeErrorDetail: true,
    },
  );
}

export function getAccounts() {
  return requestJson(`${BASE}/accounts`, {
    errorMessage: "Failed to fetch accounts",
  });
}

/**
 * Create an account, optionally with its first monthly balance. Passing
 * initialBalance ({ balance, date }) makes this one atomic request: the API
 * creates both or neither, so a failed balance can't leave an empty account.
 */
export function createAccount({
  accountName,
  accountType,
  category,
  initialBalance,
}) {
  return requestJson(`${BASE}/accounts`, {
    method: "POST",
    body: {
      accountName,
      accountType,
      category,
      ...(initialBalance && {
        balance: initialBalance.balance,
        balanceDate: initialBalance.date,
      }),
    },
    errorMessage: "Failed to create account",
    includeErrorDetail: true,
  });
}

export function getTransactions() {
  return requestJson(`${BASE}/transactions`, {
    errorMessage: "Failed to fetch transactions",
  });
}

export function createTransaction({ name, transactionType, amount, cash }) {
  return requestJson(`${BASE}/transactions`, {
    method: "POST",
    body: { name, transactionType, amount, cash },
    errorMessage: "Failed to create transaction",
    includeErrorDetail: true,
  });
}

export function deleteTransaction(id) {
  return requestMaybeJson(`${BASE}/transactions/${id}`, {
    method: "DELETE",
    errorMessage: "Failed to delete transaction",
    includeErrorDetail: true,
  });
}

export function updateTransaction(id, name, amount, paid) {
  return requestMaybeJson(`${BASE}/transactions/${id}`, {
    method: "PUT",
    body: { name, amount, paid },
    errorMessage: "Failed to update transaction",
    includeErrorDetail: true,
  });
}

export function clearAllPaid() {
  return requestMaybeJson(`${BASE}/transactions/clear-paid`, {
    method: "PUT",
    errorMessage: "Failed to clear paid status",
    includeErrorDetail: true,
  });
}

export function getIncomeSources() {
  return requestJson(`${BASE}/income-sources`, {
    errorMessage: "Failed to fetch income sources",
  });
}

export function createIncomeSource(year, name, amount) {
  return requestJson(`${BASE}/income-sources`, {
    method: "POST",
    body: { year, name, amount },
    errorMessage: "Failed to create income source",
    includeErrorDetail: true,
  });
}

export function updateIncomeSource(id, name, amount) {
  return requestMaybeJson(`${BASE}/income-sources/${id}`, {
    method: "PUT",
    body: { name, amount },
    errorMessage: "Failed to update income source",
    includeErrorDetail: true,
  });
}

export function deleteIncomeSource(id) {
  return requestMaybeJson(`${BASE}/income-sources/${id}`, {
    method: "DELETE",
    errorMessage: "Failed to delete income source",
    includeErrorDetail: true,
  });
}
