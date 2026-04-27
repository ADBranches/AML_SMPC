import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
};

export function Input({ label, helperText, className = "", id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={[
          "w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none",
          "focus:border-slate-700 focus:ring-2 focus:ring-slate-200",
          className,
        ].join(" ")}
        {...props}
      />
      {helperText ? <span className="mt-1 block text-xs text-slate-500">{helperText}</span> : null}
    </label>
  );
}
