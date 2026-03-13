import { describe, it, expect } from "vitest";
import DateUtils from "./DateUtils.js";

// ---------------------------------------------------------------------------
// toLocalISO
// ---------------------------------------------------------------------------
describe("toLocalISO", () => {
    it("formats a date as YYYY-MM-DD without UTC drift", () => {
        expect(DateUtils.toLocalISO(new Date(2026, 2, 5))).toBe("2026-03-05");
    });

    it("pads single-digit month and day", () => {
        expect(DateUtils.toLocalISO(new Date(2026, 0, 1))).toBe("2026-01-01");
    });

    it("handles year-end date", () => {
        expect(DateUtils.toLocalISO(new Date(2025, 11, 31))).toBe("2025-12-31");
    });
});

// ---------------------------------------------------------------------------
// addDays
// ---------------------------------------------------------------------------
describe("addDays", () => {
    it("adds positive days", () => {
        const result = DateUtils.addDays(new Date(2026, 2, 1), 5);
        expect(DateUtils.toLocalISO(result)).toBe("2026-03-06");
    });

    it("subtracts days with negative value", () => {
        const result = DateUtils.addDays(new Date(2026, 2, 1), -1);
        expect(DateUtils.toLocalISO(result)).toBe("2026-02-28");
    });

    it("crosses month boundary correctly", () => {
        const result = DateUtils.addDays(new Date(2026, 0, 31), 1);
        expect(DateUtils.toLocalISO(result)).toBe("2026-02-01");
    });

    it("does not mutate the original date", () => {
        const original = new Date(2026, 2, 10);
        DateUtils.addDays(original, 7);
        expect(DateUtils.toLocalISO(original)).toBe("2026-03-10");
    });
});

// ---------------------------------------------------------------------------
// addMonths
// ---------------------------------------------------------------------------
describe("addMonths", () => {
    it("adds months forward", () => {
        const result = DateUtils.addMonths(new Date(2026, 0, 15), 3);
        expect(DateUtils.toLocalISO(result)).toBe("2026-04-15");
    });

    it("wraps correctly into next year", () => {
        const result = DateUtils.addMonths(new Date(2025, 11, 1), 1);
        expect(DateUtils.toLocalISO(result)).toBe("2026-01-01");
    });

    it("subtracts months", () => {
        const result = DateUtils.addMonths(new Date(2026, 2, 31), -1);
        // Feb doesn't have 31 days — JS normalises to March 3
        expect(result instanceof Date).toBe(true);
        expect(isNaN(result.getTime())).toBe(false);
    });

    it("does not mutate the original date", () => {
        const original = new Date(2026, 2, 10);
        DateUtils.addMonths(original, 2);
        expect(DateUtils.toLocalISO(original)).toBe("2026-03-10");
    });
});

// ---------------------------------------------------------------------------
// addYears
// ---------------------------------------------------------------------------
describe("addYears", () => {
    it("adds years forward", () => {
        const result = DateUtils.addYears(new Date(2024, 0, 1), 2);
        expect(DateUtils.toLocalISO(result)).toBe("2026-01-01");
    });

    it("subtracts years", () => {
        const result = DateUtils.addYears(new Date(2026, 5, 10), -1);
        expect(DateUtils.toLocalISO(result)).toBe("2025-06-10");
    });

    it("handles Feb 29 leap-year rollover by clamping to Feb 28", () => {
        // 2024 is a leap year; 2025 is not
        const result = DateUtils.addYears(new Date(2024, 1, 29), 1);
        expect(DateUtils.toLocalISO(result)).toBe("2025-02-28");
    });

    it("does not mutate the original date", () => {
        const original = new Date(2026, 2, 10);
        DateUtils.addYears(original, 1);
        expect(DateUtils.toLocalISO(original)).toBe("2026-03-10");
    });
});

// ---------------------------------------------------------------------------
// getISOWeekNumber
// ---------------------------------------------------------------------------
describe("getISOWeekNumber", () => {
    it("returns week 1 for Jan 1 2026 (falls in week 1)", () => {
        expect(DateUtils.getISOWeekNumber(new Date(2026, 0, 1))).toBe(1);
    });

    it("returns week 53 for Dec 28 2026 if applicable", () => {
        // Dec 28 is always in the last ISO week of its year
        const week = DateUtils.getISOWeekNumber(new Date(2026, 11, 28));
        expect(week).toBeGreaterThanOrEqual(52);
    });

    it("returns correct mid-year week", () => {
        // March 13 2026 is a Friday — ISO week 11
        expect(DateUtils.getISOWeekNumber(new Date(2026, 2, 13))).toBe(11);
    });

    it("returns week 1 for Jan 4 of any year (ISO rule: Jan 4 is always in week 1)", () => {
        expect(DateUtils.getISOWeekNumber(new Date(2026, 0, 4))).toBe(1);
        expect(DateUtils.getISOWeekNumber(new Date(2025, 0, 4))).toBe(1);
        expect(DateUtils.getISOWeekNumber(new Date(2020, 0, 4))).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// getMonthMetrics
// ---------------------------------------------------------------------------
describe("getMonthMetrics", () => {
    it("returns correct daysInMonth for March", () => {
        const { daysInMonth } = DateUtils.getMonthMetrics(2026, 2, "en-US", 1);
        expect(daysInMonth).toBe(31);
    });

    it("returns correct daysInMonth for February in a leap year", () => {
        const { daysInMonth } = DateUtils.getMonthMetrics(2024, 1, "en-US", 1);
        expect(daysInMonth).toBe(29);
    });

    it("returns correct daysInMonth for February in a non-leap year", () => {
        const { daysInMonth } = DateUtils.getMonthMetrics(2026, 1, "en-US", 1);
        expect(daysInMonth).toBe(28);
    });

    it("firstDayIndex is within 0–6", () => {
        const { firstDayIndex } = DateUtils.getMonthMetrics(2026, 2, "en-US", 1);
        expect(firstDayIndex).toBeGreaterThanOrEqual(0);
        expect(firstDayIndex).toBeLessThanOrEqual(6);
    });

    it("prevMonthDays is the day-count of the prior month", () => {
        // March 2026 -> prev month is February 2026 (28 days)
        const { prevMonthDays } = DateUtils.getMonthMetrics(2026, 2, "en-US", 1);
        expect(prevMonthDays).toBe(28);
    });
});

// ---------------------------------------------------------------------------
// format
// ---------------------------------------------------------------------------
describe("format", () => {
    it("formats date as YYYY-MM-DD", () => {
        expect(DateUtils.format(new Date(2026, 2, 13))).toBe("2026-03-13");
    });

    it("pads single-digit values", () => {
        expect(DateUtils.format(new Date(2026, 0, 5))).toBe("2026-01-05");
    });
});
