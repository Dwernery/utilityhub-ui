export function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-xl font-bold text-slate-800 mb-2">Page not found</h1>
      <p className="text-sm text-slate-500 mb-4">
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        Go to Home
      </a>
    </div>
  );
}
