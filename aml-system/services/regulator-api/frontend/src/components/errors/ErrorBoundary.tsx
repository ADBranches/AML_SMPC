import { Component, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="m-6 rounded-2xl border border-red-300 bg-red-50 p-6 text-red-700">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm">{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
