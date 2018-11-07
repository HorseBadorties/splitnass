import "jasmine";
import { Runde, Gespielt, Ansage } from "../model/runde";
import { Spieltag } from "../model/spieltag";

const spieltag = new Spieltag();
let runde = new Runde(spieltag, 1);

beforeEach(() => runde = new Runde(spieltag, 1));

describe("Runde berechnen - gespaltener Arsch", () => {
  it("Re gewinnt keine 6 ohne Ansage => 0 (Gespaltener Arsch)", () => {
      runde.gespielt = Gespielt.ReKeine6;
      expect(runde.berechneErgebnis()).toEqual(0);
  });
  it("Kontra gewinnt keine 6 ohne Ansage => 0 (Gespaltener Arsch)", () => {
    runde.gespielt = Gespielt.KontraKeine6;
    expect(runde.berechneErgebnis()).toEqual(0);
  });
  it("Gespaltener Arsch => 0", () => {
    runde.gespielt = Gespielt.GespaltenerArsch;
    expect(runde.berechneErgebnis()).toEqual(0);
  });
});

describe("Runde berechnen", () => {
  it("Re gewinnt 120 => 1", () => {
      runde.gespielt = Gespielt.Re;
      expect(runde.berechneErgebnis()).toEqual(1);
  });
  it("Kontra gewinnt 120 => 2", () => {
      runde.gespielt = Gespielt.Kontra;
      expect(runde.berechneErgebnis()).toEqual(2);
  });
  it("Re v.V.h. - Re gewinnt 120 => 4", () => {
      runde.reAngesagt = Ansage.ReOderKontra;
      runde.reVonVorneHerein = true;
      runde.gespielt = Gespielt.Re;
      expect(runde.berechneErgebnis()).toEqual(4);
  });
  it("Kontra v.V.h. - Kontra gewinnt 120 => 6", () => {
      runde.kontraAngesagt = Ansage.ReOderKontra;
      runde.kontraVonVorneHerein = true;
      runde.gespielt = Gespielt.Kontra;
      expect(runde.berechneErgebnis()).toEqual(6);
  });
  it("Re keine 6 ang., Kontra keine 9 ang. - Kontra gewinnt keine 9 => 32", () => {
    runde.reAngesagt = Ansage.Keine6;
    runde.kontraAngesagt = Ansage.Keine9;
    runde.gespielt = Gespielt.KontraKeine9;
    // k6, k6, k9, k9, k9, k9, 120, g.d.A., 2 Böcke
    expect(runde.berechneErgebnis()).toEqual(32);
  });
  it("Re keine 6 ang., Kontra ang. - Kontra gewinnt keine 9 => 28", () => {
    runde.reAngesagt = Ansage.Keine6;
    runde.kontraAngesagt = Ansage.ReOderKontra;
    runde.gespielt = Gespielt.KontraKeine9;
    // k6, k6, k9, k9, k9, 120, g.d.A., 2 Böcke
    expect(runde.berechneErgebnis()).toEqual(28);
  });
});
