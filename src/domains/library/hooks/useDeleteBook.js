import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBook } from "../api.js";

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
