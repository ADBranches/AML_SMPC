import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50";

  const variants = {
    primary: "bg-slate-950 text-white hover:bg-slate-800",
    secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const classes = [base, variants[variant], className].filter(Boolean).join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
