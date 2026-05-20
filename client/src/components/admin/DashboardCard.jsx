export default function DashboardCard({ title, value, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    black: 'bg-gray-100 text-gray-950',
  };

  return (
    <div className="rounded-lg bg-white p-5 shadow-soft">
      <div className={`mb-4 grid h-11 w-11 place-items-center rounded-md ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-1 text-2xl font-black text-gray-950">{value}</p>
    </div>
  );
}
