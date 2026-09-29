import { describe, expect, it } from "vitest";
import { SEED_ROOMS, SEED_VENUES } from "@/content/programme-seed";
import { buildLocationOptions, decodeLocation, describeLocation, encodeLocation } from "@/lib/admin/location";

const venues = new Map(SEED_VENUES.map((v) => [v.id, v]));
const rooms = new Map(SEED_ROOMS.map((r) => [r.id, { ...r, active: true }]));

describe("ubicación del formulario (select ↔ roomId/venueId)", () => {
  it.each([
    [{ roomId: "aula-17a", venueId: null }, "room:aula-17a"],
    [{ roomId: null, venueId: "solis" }, "venue:solis"],
    [{ roomId: null, venueId: null }, "general"],
  ])("%o ↔ %s", (ref, value) => {
    expect(encodeLocation(ref.roomId, ref.venueId)).toBe(value);
    expect(decodeLocation(value)).toEqual(ref);
  });

  it("con sala, la sala manda sobre el edificio", () => {
    expect(encodeLocation("aula-12a", "solis")).toBe("room:aula-12a");
  });

  it("describe las ubicaciones de la semilla", () => {
    expect(describeLocation({ roomId: "salon-actos", venueId: null }, venues, rooms)).toMatchObject({
      scope: "room",
      label: "Salón de actos",
      detail: "Edificio Solís",
    });
    expect(describeLocation({ roomId: null, venueId: "solis" }, venues, rooms).label).toBe(
      "Todo el edificio: Edificio Solís",
    );
    expect(describeLocation({ roomId: null, venueId: null }, venues, rooms).label).toBe("Fila general");
  });

  it("agrupa las salas por edificio en el orden de la semilla", () => {
    const { general, wholeVenues, groups } = buildLocationOptions(SEED_VENUES, SEED_ROOMS.map((r) => ({ ...r, active: true })));
    expect(general.value).toBe("general");
    expect(wholeVenues.map((o) => o.value)).toEqual(["venue:solis"]);
    expect(groups.map((g) => [g.label, g.options.map((o) => o.value)])).toEqual([
      [
        "Edificio Solís",
        ["room:salon-actos", "room:aula-17a", "room:aula-12a", "room:laboratorio", "room:sala-usos-multiples"],
      ],
    ]);
  });
});
