import { useQuery } from "@tanstack/react-query";
import { getSeries } from "../api.js";

export function useSeries() {
  return useQuery({
    queryKey: ["series"],
    queryFn: getSeries,
    refetchOnWindowFocus: false,
  });
}
