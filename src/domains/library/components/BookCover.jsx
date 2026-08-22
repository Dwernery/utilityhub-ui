import { Book } from "lucide-react";
import { useState } from "react";

export default function BookCover({ book, className = "" }) {
  const [src, setSrc] = useState(null);
  //   useEffect(() => {
  //     setSrc(null);
  //     let cancelled = false;
  //     async function fetchCover() {
  //       try {
  //         const q = book.isbn
  //           ? `isbn:${book.isbn}`
  //           : `intitle:${encodeURIComponent(book.title)}+inauthor:${encodeURIComponent(book.author)}`;
  //         const res = await fetch(
  //           `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=items(volumeInfo/imageLinks)`,
  //         );
  //         const data = await res.json();
  //         const img = data?.items?.[0]?.volumeInfo?.imageLinks;
  //         if (!cancelled) setSrc(img?.thumbnail || img?.smallThumbnail || null);
  //       } catch {
  //         /* silent */
  //       }
  //     }
  //     fetchCover();
  //     return () => {
  //       cancelled = true;
  //     };
  //   }, [book.isbn, book.title, book.author]);

  if (src)
    return (
      <img
        src={src}
        alt={book.title}
        className={`object-cover ${className}`}
        onError={() => setSrc(null)}
      />
    );
  return (
    <div
      className={`bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center ${className}`}
    >
      <Book className="w-8 h-8 text-slate-400" />
    </div>
  );
}
