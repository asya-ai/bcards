"use client";

export function LocalTime({ dateTime, className }: { dateTime: string; className?: string }) {
  const formatted = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateTime));

  return (
    <time dateTime={dateTime} className={className}>
      {formatted}
    </time>
  );
}
