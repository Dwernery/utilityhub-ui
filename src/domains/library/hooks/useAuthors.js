import { useQuery } from "@tanstack/react-query";
import { getAuthors } from "../api.js";
import { AUTHORS_KEY } from "./queryKeys.js";

export function useAuthors() {
  return useQuery({
    queryKey: AUTHORS_KEY,
    queryFn: getAuthors,
    refetchOnWindowFocus: false,
  });
}
