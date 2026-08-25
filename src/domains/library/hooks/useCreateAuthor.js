import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAuthor } from "../api.js";
import { AUTHORS_KEY } from "./queryKeys.js";

export function useCreateAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name) => createAuthor(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTHORS_KEY });
    },
  });
}
