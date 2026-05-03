"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ReactNode, useCallback, useState } from "react";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight?: number;
  gap?: number;
  maxHeight?: string;
  className?: string;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
  isLoading?: boolean;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 60,
  gap = 8,
  maxHeight = "290px",
  className = "",
  emptyState,
  loadingState,
  isLoading = false,
}: VirtualizedListProps<T>) {
  "use no memo";

  const [parentNode, setParentNode] = useState<HTMLDivElement | null>(null);
  const listRefCallback = useCallback((node: HTMLDivElement) => {
    if (node) {
      setParentNode(node);
    }
  }, []);

  /* eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual's useVirtualizer() returns functions that cannot be memoized safely */
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentNode,
    estimateSize: useCallback(() => itemHeight, [itemHeight]),
    gap,
  });

  return (
    <div ref={listRefCallback} className={`overflow-auto ${className}`} style={{ maxHeight }}>
      {isLoading ? (
        loadingState || <div className="p-3 text-center text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        emptyState || <div className="p-3 text-center text-slate-400">No items found.</div>
      ) : (
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize() + 8}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index];
            if (!item) return null;

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {renderItem(item, virtualItem.index)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
