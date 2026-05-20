export default function Loader() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-lg bg-white shadow-soft">
          <div className="h-40 rounded-t-lg bg-gray-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="h-10 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
