import * as _ from "lodash";

import { Solo } from "./solo";
import { Spieler } from "./spieler";
import { Spieltag } from "./spieltag";

export const MAX_BOECKE = 3;

export class Runde {

  public static fromJsonObject(jsonObject: any, spieltag: Spieltag): Runde {
    const result = new Runde(spieltag, jsonObject.nr);
    Object.assign(result, jsonObject);
    result.spieler = jsonObject.spieler.map(s => spieltag.findSpielerById(s.id));
    result.geber = jsonObject.geber ? spieltag.findSpielerById(jsonObject.geber.id) : undefined;
    result.aufspieler = jsonObject.aufspieler ? spieltag.findSpielerById(jsonObject.aufspieler.id) : undefined;
    result.gewinner = jsonObject.gewinner.map(s => spieltag.findSpielerById(s.id));
    result.solo = Solo.get(jsonObject.solo);
    return result;
  }

  constructor(
    public spieltag: Spieltag,
    public nr: number,
    public isGestartet = false,
    public isBeendet = false,
    public spieler: Array<Spieler> = [],
    public geber?: Spieler,
    public aufspieler?: Spieler,
    public gewinner: Array<Spieler> = [],
    // Ansagen
    public reVonVorneHerein = false,
    public reAngesagt = Ansage.KeineAnsage,
    public kontraVonVorneHerein = false,
    public kontraAngesagt = Ansage.KeineAnsage,
    // Boecke
    public boecke = 0,
    public boeckeBeiBeginn = 0,
    // Gespielt
    // 0 = kein Ergebnis/gespaltener Arsch, positiv = Re gewinnt, negativ = Kontra gewinnt
    public gespielt?: Gespielt,
    public solo = Solo.KEIN_SOLO,
    public reGewinnt = false,
    public gegenDieSau = false,
    public extrapunkte = 0,
    public armut = false,
    public herzGehtRum = false,
    public ergebnis: number = -1,
    private _ergebnisEvents: Array<object> = null) { }

  public start() {
    this.boeckeBeiBeginn = this.boecke;
    this.isGestartet = true;
  }

  public beenden() {
    if (!this.isGespielteRunde()) {
      this.doBoecke();
    }
    this.isBeendet = true;
  }

  public isAktuelleRunde() {
    return this.isGestartet && !this.isBeendet;
  }

  public isGespielteRunde() {
    return this.isBeendet;
  }

  public isDummyRunde() {
    return this.isBeendet && !this.geber;
  }

  public addBock() {
    if (this.boecke < MAX_BOECKE) {
      this.boecke++;
    } else {
      this.spieltag.bock();
    }
  }

  private doBoecke() {
    this.boecke = this.boeckeBeiBeginn;
    if (this.reAngesagt) {
      this.addBock();
    }
    if (this.kontraAngesagt) {
      this.addBock();
    }
    if (this.herzGehtRum) {
      this.spieltag.boecke();
    }
    if (this.reAngesagt && this.kontraAngesagt) {
      this.spieltag.boecke();
    }
    if (this.ergebnis === 0) {
      this.spieltag.boecke();
    }
  }

  public berechneErgebnis() {
    if (this.gespielt === null || this.isDummyRunde()) return;
    this.ergebnis = 0;
    this._ergebnisEvents = [];
    if (this.herzGehtRum) {
      this._ergebnisEvents.push({"event": "Herz geht rum", "icon": "pi-info"});
    }
    // Boecke
    let _boecke = this.boeckeBeiBeginn;
    if (this.reAngesagt) {
      _boecke++;
    }
    if (this.kontraAngesagt) {
      _boecke++;
    }
    if (this.gespielt === 0) {
      // Gespaltener Arsch!?
      this._ergebnisEvents.push({"event": "Gespaltener Arsch", "icon": "pi-trash"});
      return this.ergebnis;
    }
    let gespieltePunkte = Math.abs(this.gespielt);
    if (this.solo === Solo.NULL) {
      // Bei Null zählt das angesagte Ergebnis. Wenn nichts angesagt, dann 120
      gespieltePunkte = this.reAngesagt > 0 ? this.reAngesagt : 1;
    }
    // Re un Kontra haben falsche Ansagen gemacht: gespaltener Arsch
    if (gespieltePunkte < this.reAngesagt && gespieltePunkte < this.kontraAngesagt && this.solo !== Solo.NULL) {
      this.ergebnis = 0;
      this._ergebnisEvents.push({"event": "Re und Kontra haben falsche Ansagen gemacht: Gespaltener Arsch", "icon": "pi-trash"});
      return this.ergebnis;
    }
    // nichts angesagt und keine 6 oder besser: gespaltener Arsch
    if (gespieltePunkte >= 3 && !this.reAngesagt && !this.kontraAngesagt && this.solo !== Solo.NULL) {
      this.ergebnis = 0;
      this._ergebnisEvents.push({"event": "Keine 6 oder besser ohne Ansage: Gespaltener Arsch", "icon": "pi-trash"});
      return this.ergebnis;
    }
    // Hat unter Berücksichtigung der Ansagen Re oder Kontra gewonnen?
    this.reGewinnt = this.gespielt > 0;
    if (this.reGewinnt) {
      this.reGewinnt = this.gespielt.valueOf() >= this.reAngesagt.valueOf() || this.solo === Solo.NULL;
    } else {
      this.reGewinnt = gespieltePunkte < this.kontraAngesagt;
    }
    // berechnen
    const maxAnsage = Math.max(this.reAngesagt, this.kontraAngesagt);
    const gespieltEvents = [];
    if (maxAnsage > gespieltePunkte && this.solo !== Solo.NULL) {
      const relevanteAnsage = this.reGewinnt ? this.kontraAngesagt : this.reAngesagt;
      _.range(maxAnsage, gespieltePunkte, -1).forEach(value => {
        if (relevanteAnsage >= value) {
          _.times(2, v => gespieltEvents.push(this.translateAnsage(value)));
          this.ergebnis += 2;
        }
      });
    }
    for (let i = gespieltePunkte; i > 0; i--) {
      const tmpErgebnis = this.ergebnis;
      this.ergebnis++;
      if (i > 1 && this.reAngesagt >= i) {
        this.ergebnis++;
        if (!this.reGewinnt && this.gespielt < 0 && this.solo !== Solo.NULL) {
          this.ergebnis++;
        }
      }
      if (i > 1 && this.kontraAngesagt >= i) {
        this.ergebnis++;
        if (this.reGewinnt && this.gespielt > 0 && this.solo !== Solo.NULL) {
          this.ergebnis++;
        }
      }
      _.times(this.ergebnis - tmpErgebnis, v => gespieltEvents.push(this.translateAnsage(i)));
    }
    this._ergebnisEvents.push({"event": gespieltEvents.join(", "), "icon": null});
    // Gegen die Alten?
    if (!this.reGewinnt && !this.armut && this.solo.gegenDieAltenMoeglich) {
      this._ergebnisEvents.push({"event": "gegen die Alten", "icon": null});
      this.ergebnis++;
    }
    if (this.gegenDieSau && this.solo.sauMoeglich) {
      this._ergebnisEvents.push({"event": "gegen die Sau", "icon": null});
      this.ergebnis++;
    }
    if (this.solo !== Solo.KEIN_SOLO) {
      this._ergebnisEvents.push({"event": "Solo", "icon": null});
      this.ergebnis++;
    }
    // verlorenes Solo?
    if (this.ergebnis > 0 && this.solo !== Solo.KEIN_SOLO && !this.reGewinnt) {
      this._ergebnisEvents.push({"event": "Solo verloren", "icon": null});
      this.ergebnis++;
    }
    if (this.reVonVorneHerein) {
      this._ergebnisEvents.push({"event": "Re von vorneherein", "icon": null});
      this.ergebnis++;
    }
    if (this.kontraVonVorneHerein) {
      this._ergebnisEvents.push({"event": "Kontra von vorneherein", "icon": null});
      this.ergebnis++;
    }
    if (this.extrapunkte !== 0) {
      this._ergebnisEvents.push({"event": `${this.extrapunkte} ${Math.abs(this.extrapunkte) === 1 ? "Extrapunkt" : "Extrapunkte"}`
        , "icon": null});
      this.ergebnis += this.extrapunkte;
    }
    // durch negative Extrapunkte kann die Gegenseite gewonnen haben...! (gegenDieAlten etc.)
    if (this.ergebnis < 0) {
      this.ergebnis = Math.abs(this.ergebnis);
      this.reGewinnt = !this.reGewinnt;
    }
    // Böcke
    _boecke = Math.min(_boecke, MAX_BOECKE);
    if (_boecke) {
      this._ergebnisEvents.push({"event": `${_boecke} ${_boecke === 1 ? "Bock" : "Böcke"}`, "icon": null});
      _.times(_boecke, v => this.ergebnis *= 2);
    }
    if (this.ergebnis === 0) {
      this._ergebnisEvents.push({"event": "Gespaltener Arsch", "icon": "pi-trash"});
    } else {
      this._ergebnisEvents.push({"event": `${this.ergebnis} ${this.ergebnis === 1 ? "Punkt" : "Punkte"}`, "icon": "pi-sign-in"});
    }
    return this.ergebnis;
  }

  private translateAnsage(ansage: number) {
    switch (ansage) {
      case 1: return "120";
      case 2: return "keine 9";
      case 3: return "keine 6";
      case 4: return "keine 3";
      case 5: return "schwarz";
      default: return "";
    }
  }

  public get ergebnisEvents() {
    if (this._ergebnisEvents === null) {
      this.berechneErgebnis();
    }
    return this._ergebnisEvents;
  }

  public setErgebnisEvents(value: Array<any>) {
    this._ergebnisEvents = value;
  }
}

export enum Gespielt {
  GespaltenerArsch = 0,
  Re = 1,
  ReKeine9 = 2,
  ReKeine6 = 3,
  ReKeine3 = 4,
  ReSchwarz = 5,
  Kontra = -1,
  KontraKeine9 = -2,
  KontraKeine6 = -3,
  KontraKeine3 = -4,
  KontraSchwarz = -5,
}

export enum Ansage {
  KeineAnsage = 0,
  ReOderKontra = 1,
  Keine9 = 2,
  Keine6 = 3,
  Keine3 = 4,
  Schwarz = 5
}
