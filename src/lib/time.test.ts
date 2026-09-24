import { describe, expect, it } from "vitest";
import { formatInZone, formatOffset, madridDate, offsetVsMadrid, sessionState, zonedParts } from "./time";

describe("hora de Madrid", () => {
  it("en febrero Madrid es UTC+1 (CET)", () => {
    expect(madridDate("2027-02-11", "09:00").toISOString()).toBe("2027-02-11T08:00:00.000Z");
  });

  it("en junio Madrid es UTC+2 (CEST), como en ICED26", () => {
    expect(madridDate("2026-06-24", "11:00").toISOString()).toBe("2026-06-24T09:00:00.000Z");
  });

  it("zonedParts devuelve día y minutos en hora de Madrid", () => {
    const p = zonedParts(new Date("2027-02-11T09:15:00Z"));
    expect(p.dayKey).toBe("2027-02-11");
    expect(p.label).toBe("10:15");
    expect(p.minutes).toBe(615);
  });

  it("Lisboa va una hora por detrás en febrero", () => {
    expect(offsetVsMadrid("2027-02-11", "10:00", "Europe/Lisbon")).toBe(-60);
    expect(formatInZone("2027-02-11", "10:00", "Europe/Lisbon")).toBe("09:00");
    expect(formatOffset(-60)).toBe("−1 h");
    expect(offsetVsMadrid("2027-02-11", "10:00", "Europe/Madrid")).toBe(0);
  });
});

describe("estado de una sesión", () => {
  const s = { day: "2027-02-11", start: "10:00", end: "11:30" };
  it("futura, en directo y pasada", () => {
    expect(sessionState(s, madridDate("2027-02-11", "09:59"))).toBe("future");
    expect(sessionState(s, madridDate("2027-02-11", "10:00"))).toBe("live");
    expect(sessionState(s, madridDate("2027-02-11", "11:29"))).toBe("live");
    expect(sessionState(s, madridDate("2027-02-11", "11:30"))).toBe("past");
    expect(sessionState(s, madridDate("2027-02-12", "09:00"))).toBe("past");
    expect(sessionState(s, madridDate("2027-02-10", "12:00"))).toBe("future");
  });
});
