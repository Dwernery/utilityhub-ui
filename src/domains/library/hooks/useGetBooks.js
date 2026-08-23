import { useQuery } from "@tanstack/react-query";
import { getBooks } from "../api.js";

export function useBooks() {
  return useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
