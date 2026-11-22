import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import {
  ACCOUNTS_KEY,
  INCOME_SOURCES_KEY,
  NET_WORTH_HISTORY_KEY,
  TRANSACTIONS_KEY,
} from "./queryKeys";

// Finance queries and mutations. Mirrors utility-hub-mobile's lib/finance/hooks.ts.

// ── Queries ────────────────────────────────────────────────────────────────

export function useNetWorthHistory() {
  return useQuery({
    queryKey: NET_WORTH_HISTORY_KEY,
    queryFn: api.getNetWorthHistory,
  });
}

export function useTransactions() {
  return useQuery({ queryKey: TRANSACTIONS_KEY, queryFn: api.getTransactions });
}

export function useIncomeSources() {
  return useQuery({
    queryKey: INCOME_SOURCES_KEY,
    queryFn: api.getIncomeSources,
  });
}

export function useAccounts() {
  return useQuery({ queryKey: ACCOUNTS_KEY, queryFn: api.getAccounts });
}

// ── Mutations ──────────────────────────────────────────────────────────────

// Each mutation refetches exactly the queries it changes, so pages never have to
// invalidate by hand (and can't forget to).

function useInvalidating(mutationFn, keys) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all(
        keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
}

export const useSetAccountBalance = () =>
  useInvalidating(
    ({ accountId, date, balance }) =>
      api.updateAccountBalance(accountId, date, balance),
    [NET_WORTH_HISTORY_KEY],
  );

export const useRemoveAccountBalance = () =>
  useInvalidating(
    ({ accountId, date }) => api.deleteAccountBalance(accountId, date),
    [NET_WORTH_HISTORY_KEY],
  );

// An initial balance changes the net-worth history too, so both are refetched.
export const useCreateAccount = () =>
  useInvalidating(api.createAccount, [ACCOUNTS_KEY, NET_WORTH_HISTORY_KEY]);

export const useUpdateTransaction = () =>
  useInvalidating(
    ({ id, name, amount, paid }) =>
      api.updateTransaction(id, name, amount, paid),
    [TRANSACTIONS_KEY],
  );

export const useCreateTransaction = () =>
  useInvalidating(api.createTransaction, [TRANSACTIONS_KEY]);

export const useDeleteTransaction = () =>
  useInvalidating((id) => api.deleteTransaction(id), [TRANSACTIONS_KEY]);

export const useClearAllPaid = () =>
  useInvalidating(() => api.clearAllPaid(), [TRANSACTIONS_KEY]);

export const useSaveIncomeSource = () =>
  useInvalidating(
    async ({ id, year, name, amount }) => {
      if (id) await api.updateIncomeSource(id, name, amount);
      else await api.createIncomeSource(year, name, amount);
    },
    [INCOME_SOURCES_KEY],
  );

export const useDeleteIncomeSource = () =>
  useInvalidating((id) => api.deleteIncomeSource(id), [INCOME_SOURCES_KEY]);
