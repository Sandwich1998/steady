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
      ? "app-card-soft rounded-[22px] p-5 text-zinc-50"
      : "app-card rounded-[22px] p-5 text-zinc-50";

  return (
    <section className={shellClass}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-50">{title}</h2>
            {description ? <p className="text-sm leading-6 text-zinc-400">{description}</p> : null}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}
