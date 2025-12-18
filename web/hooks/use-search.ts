import { useState, useMemo } from "react";

interface UseSearchOptions<T> {
  keys: (keyof T)[];
  caseSensitive?: boolean;
}

export function useSearch<T>(items: T[], options: UseSearchOptions<T>) {
  const { keys, caseSensitive = false } = options;
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items;
    }

    const searchTerm = caseSensitive ? query : query.toLowerCase();

    return items.filter((item) =>
      keys.some((key) => {
        const value = item[key];
        if (typeof value !== "string") {
          return false;
        }
        const compareValue = caseSensitive ? value : value.toLowerCase();
        return compareValue.includes(searchTerm);
      })
    );
  }, [items, query, keys, caseSensitive]);

  return {
    query,
    setQuery,
    filteredItems,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length,
  };
}
