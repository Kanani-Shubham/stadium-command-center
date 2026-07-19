import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const BuggyComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Simulated component crash");
  }
  return <div>Component is healthy</div>;
};

describe("ErrorBoundary Component", () => {
  let consoleSpy: any;

  beforeEach(() => {
    // Spy on console.error and suppress logs from React boundary catching
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("renders children when there are no errors", () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Component is healthy")).toBeInTheDocument();
  });

  it("renders default fallback UI and catches render errors", () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls custom fallback function if provided", () => {
    const customFallback = vi.fn((err: Error, reset: () => void) => (
      <div>
        <span>Error: {err.message}</span>
        <button onClick={reset}>Reset Custom</button>
      </div>
    ));

    render(
      <ErrorBoundary fallback={customFallback}>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Error: Simulated component crash")).toBeInTheDocument();
    expect(customFallback).toHaveBeenCalled();
  });

  it("recovers and tries rendering children again when clicked try again", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Rerender with standard component (healthy state)
    rerender(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    // Click try again to reset error boundary state
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.getByText("Component is healthy")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });
});
