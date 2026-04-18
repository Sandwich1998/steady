type StatsStripProps = {
  totalHabits: number;
  buildHabits: number;
  breakHabits: number;
  urgesResisted: number;
  dayCompleted: boolean;
};

export function StatsStrip({
  totalHabits,
  buildHabits,
  breakHabits,
  urgesResisted,
  dayCompleted,
}: StatsStripProps) {
  const stats = [
    { label: "Total habits", value: totalHabits.toString() },
    { label: "Build habits", value: buildHabits.toString() },
    { label: "Break habits", value: breakHabits.toString() },
    { label: "Urges resisted", value: urgesResisted.toString() },
    { label: "Day status", value: dayCompleted ? "Won" : "Open" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[24px] border border-white/8 bg-[#171717] p-4"
        >
          <div className="text-sm text-white/70">{stat.label}</div>
          <div className="mt-2 text-2xl font-semibold text-white">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
