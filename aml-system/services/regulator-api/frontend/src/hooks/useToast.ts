import { useCallback, useState } from "react";

export type ToastMessage = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback((message: string, type: ToastMessage["type"] = "info") => {
    const id = Date.now().toString();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, notify, dismiss };
}
