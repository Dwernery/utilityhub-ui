import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBook } from "../api.js";
import { BOOKS_KEY } from "./queryKeys.js";

export function useAddBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEY });
    },
  });
}
