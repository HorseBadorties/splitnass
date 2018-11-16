import "jasmine";
import { Spieltag } from "../model/spieltag";
import { Spieler } from "../model/spieler";
import { Gespielt } from "../model/runde";

function spieltagWith(anzahlRunden = 42, spielerCount = 4, geber = 0) {
  const spieler = Spieler.all.slice(0, spielerCount);
  return new Spieltag().start(anzahlRunden, spieler, spieler[geber]);
}

// beforeEach(() => runde = new Runde(spieltag, 1));

describe("Böcke", () => {
  it("Vier Spieler", () => {
    const spieltag = spieltagWith().boecke();
    expect(spieltag.runden[0].boecke).toEqual(0);
    expect(spieltag.runden[1].boecke).toEqual(1);
    expect(spieltag.runden[4].boecke).toEqual(1);
    expect(spieltag.runden[5].boecke).toEqual(0);
  });
  it("Fünf Spieler", () => {
    const spieltag = spieltagWith(42, 5).boecke();
    expect(spieltag.runden[0].boecke).toEqual(0);
    expect(spieltag.runden[1].boecke).toEqual(1);
    expect(spieltag.runden[5].boecke).toEqual(1);
    expect(spieltag.runden[6].boecke).toEqual(0);
  });
  it("Sechs Spieler", () => {
    const spieltag = spieltagWith(42, 6).boecke();
    expect(spieltag.runden[0].boecke).toEqual(0);
    expect(spieltag.runden[1].boecke).toEqual(1);
    expect(spieltag.runden[6].boecke).toEqual(1);
    expect(spieltag.runden[7].boecke).toEqual(0);
  });
});

describe("Doppelböcke", () => {
  it("Vier Spieler", () => {
    const spieltag = spieltagWith().boecke().startNaechsteRunde().boecke();
    expect(spieltag.runden[0].boecke).toEqual(0);
    expect(spieltag.runden[1].boecke).toEqual(1);
    expect(spieltag.runden[2].boecke).toEqual(2);
    expect(spieltag.runden[4].boecke).toEqual(2);
    expect(spieltag.runden[5].boecke).toEqual(1);
  });
});

describe("Keine Dreifachböcke", () => {
  it("Vier Spieler", () => {
    const spieltag =
      spieltagWith().boecke().startNaechsteRunde().boecke().startNaechsteRunde().boecke();
    expect(spieltag.runden[1].boecke).toEqual(1);
    expect(spieltag.runden[2].boecke).toEqual(2);
    expect(spieltag.runden[4].boecke).toEqual(2);
    expect(spieltag.runden[5].boecke).toEqual(2);
    expect(spieltag.runden[6].boecke).toEqual(1);
    expect(spieltag.runden[8].boecke).toEqual(1);
    expect(spieltag.runden[9].boecke).toEqual(0);
  });
});

describe("Sammeln am Ende des Spieltags", () => {
  it("Einer passt nicht mehr", () => {
    const spieltag = spieltagWith(4, 4).boecke();
    expect(spieltag.runden[1].boecke).toEqual(2);
    expect(spieltag.runden[2].boecke).toEqual(1);
    expect(spieltag.runden[3].boecke).toEqual(1);
  });
  it("Zwei entfallen", () => {
    const spieltag = spieltagWith(2, 4).boecke();
    expect(spieltag.runden[1].boecke).toEqual(2);
  });
});

describe("Undo Böcke", () => {
  it("Vier Spieler", () => {
    const spieltag = spieltagWith().boecke().undoBoecke(4);
    expect(spieltag.runden.find(r => r.boecke > 0)).toEqual(undefined);
  });
  it("Fünf Spieler", () => {
    const spieltag = spieltagWith(42, 5).boecke().undoBoecke(5);
    expect(spieltag.runden.find(r => r.boecke > 0)).toEqual(undefined);
  });
});

describe("Undo Böcke am Ende des Spieltags", () => {
  it("Undo - Einer passt nicht mehr", () => {
    const spieltag = spieltagWith(4, 4).boecke().startNaechsteRunde().undoBoecke(4);
    expect(spieltag.runden.find(r => r.boecke > 0)).toEqual(undefined);
  });
});

describe("Undo letzte Runde", () => {
  it("Undo - Re gewinnt", () => {
    const spieltag = spieltagWith(4, 4);
    const r1 = spieltag.aktuelleRunde;
    const r2 = spieltag.getNaechsteRunde(r1);
    r1.gespielt = Gespielt.Re;
    r1.berechneErgebnis();
    expect(r1.ergebnis).toEqual(1);
    spieltag.startNaechsteRunde();
    expect(spieltag.aktuelleRunde).toEqual(r2);
    expect(r1.isGespielteRunde()).toEqual(true);
    expect(r2.isGestartet).toEqual(true);
    spieltag.undoLetzteRunde();
    expect(r1.ergebnis).toEqual(-1);
    expect(spieltag.aktuelleRunde).toEqual(r1);
    expect(r1.isGespielteRunde()).toEqual(false);
    expect(r2.isGestartet).toEqual(false);
  });
});




