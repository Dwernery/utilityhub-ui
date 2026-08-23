import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBookRating } from "../api.js";

export function useUpdateBookRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBookRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
