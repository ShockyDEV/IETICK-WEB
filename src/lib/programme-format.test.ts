import { describe, expect, it } from "vitest";
import { dayMonth, monthShort, shortDay } from "./programme-format";

describe("fechas cortas del programa", () => {
  it("español", () => {
    expect(shortDay("2027-02-11", "es")).toBe("Jue 11");
    expect(monthShort("2027-02-11", "es")).toBe("feb");
    expect(dayMonth("2027-02-12", "es")).toBe("12 feb");
  });

  it("portugués (pt-PT escribe día + mes corto como «11/02»: se evita)", () => {
    expect(shortDay("2027-02-11", "pt")).toBe("Quinta 11");
    expect(monthShort("2027-02-11", "pt")).toBe("fev");
    expect(dayMonth("2027-02-12", "pt")).toBe("12 fev");
  });
});
