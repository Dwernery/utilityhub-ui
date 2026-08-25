import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBook } from "../api.js";
import { BOOKS_KEY } from "./queryKeys.js";

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEY });
    },
  });
}
