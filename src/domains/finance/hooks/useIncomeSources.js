import { useQuery } from "@tanstack/react-query";
import { getIncomeSources } from "../api.js";
import { INCOME_SOURCES_KEY } from "./queryKeys.js";

export function useIncomeSources() {
  return useQuery({
    queryKey: INCOME_SOURCES_KEY,
    queryFn: getIncomeSources,
    refetchOnWindowFocus: false,
  });
}
