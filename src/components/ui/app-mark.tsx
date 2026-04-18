type AppMarkProps = {
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
} as const;

export function AppMark({ size = "md" }: AppMarkProps) {
  return (
    <div
      className={`${sizeClasses[size]} relative rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,50,57,0.96)_0%,rgba(18,28,33,0.98)_100%)] shadow-[0_16px_32px_-24px_rgba(6,14,18,0.9)]`}
      aria-hidden="true"
    >
      <div className="absolute inset-2 rounded-[14px] border border-white/8" />
      <div className="absolute inset-[9px] rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/88" />
      <div className="absolute right-[8px] top-[8px] h-2 w-2 rounded-full bg-white/24" />
    </div>
  );
}
