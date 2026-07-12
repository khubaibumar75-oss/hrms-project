import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  variant?: "inline" | "block";
  label?: string;
  className?: string;
}

export default function Loader({
  variant = "block",
  label,
  className,
}: LoaderProps) {
  if (variant === "inline") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 text-sm text-muted-foreground",
          className,
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[240px] flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex gap-4 rounded-md border border-border bg-card px-4 py-3.5"
        >
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={c}
              className="h-4 flex-1 animate-pulse rounded bg-muted"
              style={{ animationDelay: `${(r * columns + c) * 30}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
