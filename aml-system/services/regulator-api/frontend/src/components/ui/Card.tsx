import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, description, children, className = "" }: CardProps) {
  return (
    <section className={["rounded-2xl border bg-white p-6 shadow-sm", className].join(" ")}>
      {title ? <h3 className="text-lg font-bold text-slate-900">{title}</h3> : null}
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      <div className={title || description ? "mt-4" : ""}>{children}</div>
    </section>
  );
}
