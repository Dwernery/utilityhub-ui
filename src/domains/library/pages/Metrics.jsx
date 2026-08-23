import { CurrentlyReading } from "../components/CurrentlyReading";
import { useBooks } from "../hooks/useGetBooks";

export default function Metrics() {
  const { data: books = [] } = useBooks();

  return (
    <div className="space-y-4">
      <CurrentlyReading books={books} />

    </div>
  );
}
