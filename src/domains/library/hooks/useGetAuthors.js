import { useQuery } from "@tanstack/react-query";
import { getAuthors } from "../api.js";

export function useAuthors() {
  return useQuery({
    queryKey: ["authors"],
    queryFn: getAuthors,
    refetchOnWindowFocus: false,
  });
}
