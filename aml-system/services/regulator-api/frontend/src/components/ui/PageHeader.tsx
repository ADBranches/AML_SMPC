type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
