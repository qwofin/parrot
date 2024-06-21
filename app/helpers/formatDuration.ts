export function formatDuration(ms: number): string {
  return new Date(ms).toISOString().substring(11, 23);
}