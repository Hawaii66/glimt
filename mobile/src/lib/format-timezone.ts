export function getDeviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatTimezoneLabel(timezone: string): string {
  return timezone.replace(/_/g, " ");
}
