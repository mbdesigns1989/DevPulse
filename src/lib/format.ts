export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

// `now` is passed in (not read internally) so this stays deterministically testable.
export function formatRelative(iso: string, now: Date): string {
  const then = new Date(iso + "T00:00:00")
  if (Number.isNaN(then.getTime())) return iso
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const days = Math.round((start.getTime() - then.getTime()) / 86_400_000)
  if (days <= 0) return "today"
  if (days === 1) return "1 day ago"
  if (days < 30) return `${days} days ago`
  const months = Math.round(days / 30)
  if (months === 1) return "about 1 month ago"
  return `${months} months ago`
}
