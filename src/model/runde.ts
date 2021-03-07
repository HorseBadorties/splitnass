import { times, range } from "lodash-es";

import { Solo } from "./solo";
import { Spieler } from "./spieler";
import { Spieltag } from "./spieltag";

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
    public subAngesagt = false,
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
    private rgebnisEvents: Array<object> = null) { }

  public reset(): Runde {
    this.isGestartet = false;
    this.isBeendet = false;
    // this.spieler = [];
    // this.geber = undefined;
    // this.aufspieler = undefined;
    this.gewinner = [];
    this.reVonVorneHerein = false;
    this.reAngesagt = Ansage.KeineAnsage;
    this.kontraVonVorneHerein = false;
    this.kontraAngesagt = Ansage.KeineAnsage;
    this.subAngesagt = false;
    this.boecke = this.boeckeBeiBeginn;
    this.gespielt = undefined;
    this.solo = Solo.KEIN_SOLO;
    this.reGewinnt = false;
    this.gegenDieSau = false;
    this.extrapunkte = 0;
    this.armut = false;
    this.herzGehtRum = false;
    this.ergebnis = -1;
    this.rgebnisEvents = null;
    return this;
  }

  public undoBoecke(): Runde {
    const verteilteReKontraSubBoecke =
      (this.boeckeBeiBeginn + (this.reAngesagt ? 1 : 0) + (this.kontraAngesagt ? 1 : 0) + (this.subAngesagt ? 1 : 0))
      - this.spieltag.rules.maxBoecke;
    if (verteilteReKontraSubBoecke > 0) {
      this.spieltag.undoBoecke(verteilteReKontraSubBoecke);
    }
    if (this.herzGehtRum && this.spieltag.rules.herzGehtRumBoecke) {
      this.spieltag.undoBoecke(this.spieltag.getAktiveSpieler().length);
    }
    if (this.reAngesagt && this.kontraAngesagt && this.spieltag.rules.reKontraBoecke) {
      this.spieltag.undoBoecke(this.spieltag.getAktiveSpieler().length);
    }
    if (this.isGespaltenerArsch() && this.spieltag.rules.gespaltenerArschBoecke) {
      this.spieltag.undoBoecke(this.spieltag.getAktiveSpieler().length);
    }
    return this;
  }


  public start(): Runde {
    this.boeckeBeiBeginn = this.boecke;
    this.isGestartet = true;
    return this;
  }

  public beenden(): Runde {
    if (!this.isGespielteRunde()) {
      this.doBoecke();
    }
    this.isBeendet = true;
    return this;
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

  public addBock(): Runde {
    if (this.boecke < this.spieltag.rules.maxBoecke) {
      this.boecke++;
    } else {
      this.spieltag.bock();
    }
    return this;
  }

  private doBoecke() {
    this.boecke = this.boeckeBeiBeginn;
    if (this.reAngesagt) {
      this.addBock();
    }
    if (this.kontraAngesagt) {
      this.addBock();
    }
    if (this.subAngesagt) {
      this.addBock();
    }
    if (this.herzGehtRum && this.spieltag.rules.herzGehtRumBoecke) {
      this.spieltag.boecke();
    }
    if (this.reAngesagt && this.kontraAngesagt && this.spieltag.rules.reKontraBoecke) {
      this.spieltag.boecke();
    }
    if (this.isGespaltenerArsch() && this.spieltag.rules.gespaltenerArschBoecke) {
      this.spieltag.boecke();
    }
  }

  public berechneErgebnis() {
    if (this.gespielt === null || this.isDummyRunde()) return;
    this.ergebnis = 0;
    this.rgebnisEvents = [];
    if (this.herzGehtRum) {
      this.rgebnisEvents.push({"event": "❤️ Herz geht rum ❤️"});
    }
    // Boecke
    let oecke = this.boeckeBeiBeginn;
    if (this.reAngesagt) {
      oecke++;
    }
    if (this.kontraAngesagt) {
      oecke++;
    }
    if (this.subAngesagt) {
      oecke++;
    }
    if (this.gespielt === Gespielt.GespaltenerArsch) {
      // Gespaltener Arsch!?
      this.rgebnisEvents.push({"event": "💩 Gespaltener Arsch 💩"});
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
      this.rgebnisEvents.push({"event": "💩 Re und Kontra haben falsche Ansagen gemacht: Gespaltener Arsch 💩"});
      return this.ergebnis;
    }
    // nichts angesagt und keine 6 oder besser: gespaltener Arsch
    if (gespieltePunkte >= 3 && !this.reAngesagt && !this.kontraAngesagt && this.solo !== Solo.NULL) {
      this.ergebnis = 0;
      this.rgebnisEvents.push({"event": "💩 Keine 6 oder besser ohne Ansage: Gespaltener Arsch 💩"});
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
      range(maxAnsage, gespieltePunkte, -1).forEach(value => {
        if (relevanteAnsage >= value) {
          times(2, v => gespieltEvents.push(this.translateAnsage(value)));
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
      times(this.ergebnis - tmpErgebnis, v => gespieltEvents.push(this.translateAnsage(i)));
    }
    this.rgebnisEvents.push({"event": gespieltEvents.join(", ")});
    // Gegen die Alten?
    if (!this.reGewinnt && !this.armut && this.solo.gegenDieAltenMoeglich) {
      this.rgebnisEvents.push({"event": "gegen die Alten"});
      this.ergebnis++;
    }
    if (this.gegenDieSau && this.solo.sauMoeglich) {
      this.rgebnisEvents.push({"event": "gegen die Sau"});
      this.ergebnis++;
    }
    if (this.solo !== Solo.KEIN_SOLO) {
      this.rgebnisEvents.push({"event": "Solo"});
      this.ergebnis++;
    }
    // verlorenes Solo?
    if (this.ergebnis > 0 && this.solo !== Solo.KEIN_SOLO && !this.reGewinnt) {
      this.rgebnisEvents.push({"event": "Solo verloren"});
      this.ergebnis++;
    }
    if (this.reVonVorneHerein) {
      this.rgebnisEvents.push({"event": "Re von vorneherein"});
      this.ergebnis++;
    }
    if (this.kontraVonVorneHerein) {
      this.rgebnisEvents.push({"event": "Kontra von vorneherein"});
      this.ergebnis++;
    }
    if (this.extrapunkte !== 0) {
      this.rgebnisEvents.push({"event": `${this.extrapunkte} ${Math.abs(this.extrapunkte) === 1 ? "Extrapunkt" : "Extrapunkte"}`});
      this.ergebnis += this.extrapunkte;
    }
    // durch negative Extrapunkte kann die Gegenseite gewonnen haben...! (gegenDieAlten etc.)
    if (this.ergebnis < 0) {
      this.ergebnis = Math.abs(this.ergebnis);
      this.reGewinnt = !this.reGewinnt;
    }
    // Böcke
    oecke = Math.min(oecke, this.spieltag.rules.maxBoecke);
    if (oecke) {
      this.rgebnisEvents.push({"event": `${oecke} ${oecke === 1 ? "Bock" : "Böcke"}`});
      times(oecke, v => this.ergebnis *= 2);
    }
    if (this.isGespaltenerArsch()) {
      this.rgebnisEvents.push({"event": "💩 Gespaltener Arsch 💩"});
    } else {
      this.rgebnisEvents.push({"event": `💎 ${this.ergebnis} ${this.ergebnis === 1 ? "Punkt" : "Punkte"} 💎`});
    }
    return this.ergebnis;
  }

  public isGespaltenerArsch() {
    return this.ergebnis === 0;
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
    if (this.rgebnisEvents === null) {
      this.berechneErgebnis();
    }
    return this.rgebnisEvents;
  }

  public setErgebnisEvents(value: Array<any>) {
    this.rgebnisEvents = value;
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
