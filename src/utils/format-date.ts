function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatRelativeDate(timestamp: number): string {
  const now = new Date();
  const then = new Date(timestamp);

  const diffDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(then).getTime()) / 86400000
  );

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  // A month or older: show as "Jul 2026"
  const month = then.toLocaleDateString("en-US", { month: "short" });
  return `${month} ${then.getFullYear()}`;
}