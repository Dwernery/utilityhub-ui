import { useQuery } from "@tanstack/react-query";
import { getNetWorthHistory } from "../api.js";
import { NET_WORTH_HISTORY_KEY } from "./queryKeys.js";

export function useNetWorthHistory() {
  return useQuery({
    queryKey: NET_WORTH_HISTORY_KEY,
    queryFn: getNetWorthHistory,
    refetchOnWindowFocus: false,
  });
}
