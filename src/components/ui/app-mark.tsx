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
      className={`${sizeClasses[size]} relative rounded-[18px] border border-white/12 bg-[radial-gradient(circle_at_28%_28%,rgba(255,244,194,0.95)_0%,rgba(248,191,73,0.92)_22%,rgba(124,108,255,0.38)_58%,rgba(18,18,20,0.9)_100%)] shadow-[0_18px_40px_-24px_rgba(124,108,255,0.9)]`}
      aria-hidden="true"
    >
      <div className="absolute inset-2 rounded-[14px] border border-white/10" />
      <div className="absolute inset-[7px] rounded-full border border-dashed border-white/15" />
      <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff7d8_0%,#f7c95b_45%,#ea8c39_100%)] shadow-[0_8px_24px_-10px_rgba(251,191,36,0.95)]" />
      <div className="absolute right-[8px] top-[8px] h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
    </div>
  );
}
