import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../api.js";
import { TRANSACTIONS_KEY } from "./queryKeys.js";

export function useTransactions() {
  return useQuery({
    queryKey: TRANSACTIONS_KEY,
    queryFn: getTransactions,
    refetchOnWindowFocus: false,
  });
}
