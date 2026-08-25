import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBook } from "../api.js";
import { BOOKS_KEY } from "./queryKeys.js";

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEY });
    },
  });
}
