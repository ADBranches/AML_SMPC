import { useCallback, useState } from "react";

export function useAsync<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const run = useCallback(
    async (...args: TArgs) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fn(...args);
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fn]
  );

  return { data, error, isLoading, run };
}
