import "jasmine";
import { Runde, Gespielt, Ansage } from "../model/runde";
import { Spieltag } from "../model/spieltag";

const spieltag = new Spieltag();
let runde = new Runde(spieltag, 1);

beforeEach(() => runde = new Runde(spieltag, 1));

describe("Runde berechnen", () => {
    it("Gespaltener Arsch bei gespielt = 0", () => {
        runde.gespielt = Gespielt.GespaltenerArsch;
        expect(runde.berechneErgebnis()).toEqual(0);
    });
    it("Re gewinnt 120", () => {
        runde.gespielt = Gespielt.Re;
        expect(runde.berechneErgebnis()).toEqual(1);
    });
    it("Kontra gewinnt 120", () => {
        runde.gespielt = Gespielt.Kontra;
        expect(runde.berechneErgebnis()).toEqual(2);
    });
    it("Re v.V.h. - Re gewinnt 120", () => {
        runde.reAngesagt = Ansage.ReOderKontra;
        runde.boecke++;
        runde.reVonVorneHerein = true;
        runde.gespielt = Gespielt.Re;
        expect(runde.berechneErgebnis()).toEqual(4);
    });
    it("Kontra v.V.h. - Kontra gewinnt 120", () => {
        runde.kontraAngesagt = Ansage.ReOderKontra;
        runde.boecke++;
        runde.kontraVonVorneHerein = true;
        runde.gespielt = Gespielt.Kontra;
        expect(runde.berechneErgebnis()).toEqual(6);
    });
});
