import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSeries } from "../api.js";
import { SERIES_KEY } from "./queryKeys.js";

export function useCreateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name) => createSeries(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERIES_KEY });
    },
  });
}
