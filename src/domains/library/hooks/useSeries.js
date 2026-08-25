import { useQuery } from "@tanstack/react-query";
import { getSeries } from "../api.js";
import { SERIES_KEY } from "./queryKeys.js";

export function useSeries() {
  return useQuery({
    queryKey: SERIES_KEY,
    queryFn: getSeries,
    refetchOnWindowFocus: false,
  });
}
