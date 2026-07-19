import { useEffect, useState } from "react";

/**
 * React hook to debounce state updates of generic type T.
 * Delay updates to a value until a specified timeout has elapsed
 * to prevent heavy operations or redundant API queries (e.g. search input).
 * 
 * @template T - The type of the value being debounced
 * @param value - The active value to watch and debounce
 * @param delay - The time delay in milliseconds (defaults to 300ms)
 * @returns The debounced value of type T
 */
export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 300);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
