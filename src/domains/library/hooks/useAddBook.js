import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBook } from "../api.js";

export function useAddBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
