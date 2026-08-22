import { useMutation } from "@tanstack/react-query";
import { createAuthor } from "../api.js";

export function useCreateAuthor() {
  return useMutation({
    mutationFn: (name) => createAuthor(name),
  });
}
