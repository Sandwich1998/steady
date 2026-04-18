import { ReactNode } from "react";

type CardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  variant?: "default" | "soft";
};

export function Card({
  title,
  description,
  children,
  action,
  variant = "default",
}: CardProps) {
  const shellClass =
    variant === "soft"
      ? "rounded-[28px] border border-white/8 bg-white/[0.03] p-5 text-white"
      : "rounded-[28px] border border-white/6 bg-[#171717] p-5 text-white shadow-[0_20px_50px_-30px_rgba(0,0,0,0.7)]";

  return (
    <section className={shellClass}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
            {description ? <p className="text-sm leading-6 text-white/70">{description}</p> : null}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}
