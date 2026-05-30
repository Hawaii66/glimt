export function formatGlimtSentTime(sentAt: string): string {
  const date = new Date(sentAt);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
