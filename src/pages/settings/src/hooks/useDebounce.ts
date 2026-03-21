import { useEffect, useState } from "react";

export const useDebounce = (value: string, delay: number = 500) => {
  const [debounceValue, setDebounceValue] = useState<string>("");

  useEffect(() => {
    const debounceTimer = setTimeout(() => setDebounceValue(value), delay);

    return () => clearTimeout(debounceTimer);
  }, [value, delay]);

  return debounceValue;
};
