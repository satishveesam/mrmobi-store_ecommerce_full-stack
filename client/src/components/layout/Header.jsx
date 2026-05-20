export default function Header({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h1 className="text-2xl font-black text-gray-950 md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
}
