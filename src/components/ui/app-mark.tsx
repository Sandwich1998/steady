import { SteadyLogo } from "@/components/ui/steady-logo";

type AppMarkProps = {
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
} as const;

export function AppMark({ size = "md" }: AppMarkProps) {
  return (
    <SteadyLogo className={`${sizeClasses[size]} drop-shadow-[0_14px_28px_rgba(6,14,18,0.42)]`} />
  );
}
