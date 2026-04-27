type ErrorBannerProps = {
  message: string;
};

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
      {message}
    </div>
  );
}
