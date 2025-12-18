import { useState, useMemo } from "react";

type FilterValue = string | number | boolean;

export function useFilter<T>(items: T[], key: keyof T, allValue: FilterValue = "all") {
  const [filter, setFilter] = useState<FilterValue>(allValue);

  const filteredItems = useMemo(() => {
    if (filter === allValue) {
      return items;
    }
    return items.filter((item) => item[key] === filter);
  }, [items, filter, key, allValue]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { [String(allValue)]: items.length };
    items.forEach((item) => {
      const value = String(item[key]);
      result[value] = (result[value] || 0) + 1;
    });
    return result;
  }, [items, key, allValue]);

  return {
    filter,
    setFilter,
    filteredItems,
    counts,
    reset: () => setFilter(allValue),
  };
}
