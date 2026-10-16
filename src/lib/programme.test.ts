import { describe, expect, it } from "vitest";
import { splitSpeaker } from "./programme";

describe("splitSpeaker", () => {
  it("separa el nombre de la afiliación", () => {
    expect(splitSpeaker("Melchor Gómez (Universidad Autónoma de Madrid)")).toEqual({
      name: "Melchor Gómez",
      affiliation: "Universidad Autónoma de Madrid",
    });
  });

  it("admite paréntesis dentro de la afiliación", () => {
    expect(splitSpeaker("Ilka Serra (Professional Doctorate in Engineering (PDEng), Brasil)")).toEqual({
      name: "Ilka Serra",
      affiliation: "Professional Doctorate in Engineering (PDEng), Brasil",
    });
  });

  it("sin paréntesis, todo es el nombre", () => {
    expect(splitSpeaker("  Prudencia Gutiérrez Esteban ")).toEqual({ name: "Prudencia Gutiérrez Esteban", affiliation: null });
  });
});
