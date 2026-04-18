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
      ? "app-card-soft rounded-[28px] p-5 text-slate-950"
      : "app-card rounded-[28px] p-5 text-slate-950";

  return (
    <section className={shellClass}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
            {description ? <p className="text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}
