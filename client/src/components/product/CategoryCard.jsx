export default function CategoryCard({ title, image, onClick }) {
  return (
    <button onClick={onClick} className="rounded-2xl bg-white p-2 sm:p-3 text-center shadow-soft border border-gray-100 transition hover:-translate-y-1 active:scale-95">
      <img src={image} alt={title} className="mb-2 h-20 sm:h-24 w-full rounded-xl object-cover" loading="lazy" />
      <span className="text-[11px] sm:text-sm font-bold text-gray-950 tracking-tight block text-center leading-none">{title}</span>
    </button>
  );
}
