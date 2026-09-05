import { Book } from "lucide-react";

export default function BookCover({ book, className = "" }) {
  if (book.s3Url)
    return (
      <img
        src={book.s3Url}
        alt={book.title}
        //className={`object-cover ${className}`}
        className="w-full h-full object-cover"
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
