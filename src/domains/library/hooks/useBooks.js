import { useQuery } from "@tanstack/react-query";
import { getBooks } from "../api.js";
import { BOOKS_KEY } from "./queryKeys.js";

export function useBooks() {
  return useQuery({
    queryKey: BOOKS_KEY,
    queryFn: getBooks,
    refetchOnWindowFocus: false,
  });
}
