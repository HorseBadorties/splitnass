import * as fs from "fs";
import * as path from "path";
import { Spieltag } from "./model/spieltag";
import { Spieler } from "./model/spieler";
import { Runde, Gespielt } from "./model/runde";
import { Solo } from "./model/solo";
import { formatDate } from "./client/app/util";

export function runMigration(callback: (s: Spieltag) => void) {
  fs.readdirSync("./migration").filter(f => path.extname(f).toLowerCase() === ".json").forEach(file => {
    const spieltag = new Spieltag();
    const oldSpieltag = JSON.parse(fs.readFileSync("./migration/" + file.toString(), "utf8"));
    spieltag.beginn = new Date(Date.parse(oldSpieltag.start));
    spieltag.name = "Spieltag vom " + formatDate(spieltag.beginn);
    spieltag.spieler = [];
    oldSpieltag.spieler.forEach(object => spieltag.spieler.push(Spieler.get(object.id)));
    spieltag.runden = [];
    oldSpieltag.runden.forEach(runde => {
      if (runde.start) {
        const newRunde = new Runde(spieltag, runde.id);
        spieltag.runden.push(newRunde);
        newRunde.isGestartet = true;
        newRunde.isBeendet = runde.ende ? true : false;
        newRunde.spieler = [];
        runde.spieler.forEach(object => newRunde.spieler.push(Spieler.get(object.id)));
        newRunde.geber = runde.geber ? Spieler.get(runde.geber.id) : undefined;
        newRunde.aufspieler = runde.aufspieler ? Spieler.get(runde.aufspieler.id) : undefined;
        newRunde.gewinner = [];
        runde.gewinner.forEach(object => newRunde.gewinner.push(Spieler.get(object.id)));
        newRunde.reVonVorneHerein = runde.reVonVorneHerein;
        newRunde.reAngesagt = runde.reAngesagt;
        newRunde.kontraVonVorneHerein = runde.kontraVonVorneHerein;
        newRunde.kontraAngesagt = runde.kontraAngesagt;
        newRunde.boecke = runde.boecke;
        newRunde.boeckeBeiBeginn = runde.boeckeBeiBeginn;
        newRunde.solo = Solo.get(runde.solo.id);
        newRunde.gegenDieSau = runde.gegenDieSau;
        newRunde.extrapunkte = runde.extrapunkte;
        newRunde.armut = runde.armut;
        newRunde.herzGehtRum = runde.herzGehtRum;
        newRunde.gespielt = Gespielt.GespaltenerArsch;
        if (runde.re) {
          newRunde.gespielt = runde.re;
        } else {
          newRunde.gespielt = -runde.kontra;
        }
        if (newRunde.isBeendet) {
          newRunde.berechneErgebnis();
          if (newRunde.ergebnis !== runde.ergebnis) {
            console.log(`Ergebnisse sind unterschiedlich: Runde ${newRunde.nr} - war ${runde.ergebnis}, ist ${newRunde.ergebnis}`);
          }
        }
        newRunde.ergebnis = runde.ergebnis;
      }
    });
    spieltag.aktuelleRunde = spieltag.runden.find(r => r.nr === oldSpieltag.aktuelleRunde.id);
    callback(spieltag);
  });
}










