import { useMutation } from "@tanstack/react-query";
import { createSeries } from "../api.js";

export function useCreateSeries() {
  return useMutation({
    mutationFn: (name) => createSeries(name),
  });
}
