import { useQuery } from "@tanstack/react-query";
import { getMcuTracker } from "../api.js";
import { MCU_TRACKER_KEY } from "./queryKeys.js";

export function useMcuTrackerData() {
  return useQuery({
    queryKey: MCU_TRACKER_KEY,
    queryFn: getMcuTracker,
    refetchOnWindowFocus: false,
  });
}
