import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBook } from "../api.js";

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
