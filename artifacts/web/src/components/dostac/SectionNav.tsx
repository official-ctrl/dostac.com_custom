import React from "react";

export interface SectionNavItem {
  id: string;
  label: string;
}

interface SectionNavProps {
  items: SectionNavItem[];
  activeId: string;
  onSelect?: (id: string) => void;
  ariaLabel?: string;
  testIdPrefix?: string;
}

export function SectionNav({ items, activeId, onSelect, ariaLabel, testIdPrefix }: SectionNavProps) {
  return (
    <nav
      className="sticky top-20 z-40 bg-white/95 backdrop-blur border-y border-slate-200/70"
      aria-label={ariaLabel}
    >
      <div className="container mx-auto px-6">
        <ul
          className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {items.map((item) => {
            const isActive = activeId === item.id;
            const baseClass =
              "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap";
            const activeClass = "bg-accent text-white";
            const inactiveClass = "text-slate-600 hover:bg-slate-100 hover:text-accent";

            return (
              <li key={item.id} className="flex-shrink-0">
                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
                    aria-current={isActive ? "true" : undefined}
                    data-testid={testIdPrefix ? `${testIdPrefix}${item.id}` : undefined}
                  >
                    {item.label}
                  </button>
                ) : (
                  <a
                    href={`#${item.id}`}
                    className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
                    aria-current={isActive ? "true" : undefined}
                    data-testid={testIdPrefix ? `${testIdPrefix}${item.id}` : undefined}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
