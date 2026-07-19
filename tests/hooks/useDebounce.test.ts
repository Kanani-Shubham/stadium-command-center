import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/lib/use-debounce";
import { describe, it, expect, vi } from "vitest";

describe("useDebounce hook", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 100));
    expect(result.current).toBe("hello");
  });

  it("updates value only after the delay has passed", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: "hello" },
    });

    expect(result.current).toBe("hello");

    // Rerender with new value
    rerender({ value: "world" });
    expect(result.current).toBe("hello"); // Still old value

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe("hello"); // Still old value

    // Fast-forward the rest of the time
    act(() => {
      vi.advanceTimersByTime(51);
    });
    expect(result.current).toBe("world"); // Updated!

    vi.useRealTimers();
  });
});
