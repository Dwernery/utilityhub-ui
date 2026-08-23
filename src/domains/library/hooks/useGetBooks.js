import { useQuery } from "@tanstack/react-query";
import { getBooks } from "../api.js";

export function useBooks() {
  return useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
