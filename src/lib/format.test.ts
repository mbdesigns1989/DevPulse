import { describe, expect, it } from "vitest"
import { formatRelative } from "@/lib/format"

const now = new Date("2026-06-14T12:00:00")

describe("formatRelative", () => {
  it("returns 'today' for the same day", () => {
    expect(formatRelative("2026-06-14", now)).toBe("today")
  })
  it("returns '1 day ago' for yesterday", () => {
    expect(formatRelative("2026-06-13", now)).toBe("1 day ago")
  })
  it("returns 'N days ago' within a month", () => {
    expect(formatRelative("2026-06-04", now)).toBe("10 days ago")
  })
  it("returns 'about 1 month ago' past ~30 days", () => {
    expect(formatRelative("2026-05-10", now)).toBe("about 1 month ago")
  })
  it("returns 'N months ago' for older", () => {
    expect(formatRelative("2026-03-14", now)).toBe("3 months ago")
  })
})
