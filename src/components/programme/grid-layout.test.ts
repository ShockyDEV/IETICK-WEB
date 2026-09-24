import { describe, expect, it } from "vitest";
import type { ProgrammeRoom, ProgrammeSession, ProgrammeVenue } from "@/lib/programme";
import { buildColumns, placeSessions, timeRange } from "./grid-layout";

const venue = (id: string, order: number): ProgrammeVenue => ({
  id,
  name: id,
  namePt: null,
  short: id,
  subtitle: null,
  subtitlePt: null,
  address: null,
  order,
});

const room = (id: string, venueId: string, order: number): ProgrammeRoom => ({
  id,
  venueId,
  name: id,
  namePt: null,
  code: null,
  capacity: null,
  floor: null,
  floorPt: null,
  description: null,
  descriptionPt: null,
  equipment: [],
  imageUrl: null,
  accessible: true,
  order,
});

const session = (id: string, start: string, end: string, where: { roomId?: string; venueId?: string } = {}): ProgrammeSession => ({
  id,
  day: "2027-02-11",
  start,
  end,
  type: "OTRO",
  title: id,
  titlePt: null,
  subtitle: null,
  subtitlePt: null,
  description: null,
  descriptionPt: null,
  speakers: null,
  chair: null,
  roomId: where.roomId ?? null,
  venueId: where.venueId ?? null,
  location: null,
  locationPt: null,
  streamUrl: null,
  cancelled: false,
  talks: [],
});

const data = {
  venues: [venue("iuce", 1), venue("facultad", 0)],
  rooms: [room("aula-12a", "iuce", 2), room("salon", "facultad", 0), room("aula-17a", "iuce", 1)],
};

describe("buildColumns", () => {
  it("ordena edificios y salas y calcula el tramo de cada edificio", () => {
    const { columns, bands } = buildColumns(data);
    expect(columns.map((c) => c.room.id)).toEqual(["salon", "aula-17a", "aula-12a"]);
    expect(bands).toEqual([
      expect.objectContaining({ start: 0, span: 1 }),
      expect.objectContaining({ start: 1, span: 2 }),
    ]);
  });
});

describe("placeSessions", () => {
  const { columns, bands } = buildColumns(data);

  it("sala → su columna; edificio → su tramo; general → todas", () => {
    const placed = placeSessions(
      [
        session("a", "10:00", "11:00", { roomId: "aula-12a" }),
        session("b", "15:30", "17:00", { venueId: "iuce" }),
        session("c", "11:30", "12:00"),
      ],
      columns,
      bands,
    );
    const by = Object.fromEntries(placed.map((p) => [p.session.id, p]));
    expect(by.a).toMatchObject({ kind: "room", col: 2, span: 1 });
    expect(by.b).toMatchObject({ kind: "venue", col: 1, span: 2 });
    expect(by.c).toMatchObject({ kind: "global", col: 0, span: 3 });
  });

  it("reparte en carriles las sesiones que se solapan en la misma sala", () => {
    const placed = placeSessions(
      [
        session("x", "10:00", "11:00", { roomId: "salon" }),
        session("y", "10:30", "11:30", { roomId: "salon" }),
        session("z", "12:00", "13:00", { roomId: "salon" }),
      ],
      columns,
      bands,
    );
    const by = Object.fromEntries(placed.map((p) => [p.session.id, p]));
    expect(by.x).toMatchObject({ lane: 0, lanes: 2 });
    expect(by.y).toMatchObject({ lane: 1, lanes: 2 });
    expect(by.z).toMatchObject({ lane: 0, lanes: 1 });
  });

  it("ignora sesiones de salas inexistentes o inactivas", () => {
    expect(placeSessions([session("q", "10:00", "11:00", { roomId: "no-existe" })], columns, bands)).toHaveLength(0);
  });
});

describe("timeRange", () => {
  it("redondea a medias horas", () => {
    expect(timeRange([session("a", "09:10", "10:00"), session("b", "18:30", "19:50")])).toEqual({ start: 540, end: 1200 });
  });
});
