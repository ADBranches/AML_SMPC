import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "./components/errors/ErrorBoundary";
import { router } from "./routes/AppRoutes";

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
