import * as _ from "lodash";

import { Runde } from "./runde";
import { Spieler } from "./spieler";
import { Rules } from "./rules";

export class Spieltag {

  public static fromJSON(jsonString: string) {
    const result = new Spieltag();
    const parsedJson = JSON.parse(jsonString);
    result.name = parsedJson.name;
    result.beginn = parsedJson.beginn ? new Date(parsedJson.beginn) : undefined;
    result.spieler = [];
    parsedJson.spieler.forEach(s => {
      const spieler = Spieler.get(s.id);
      spieler.isAktiv = s.isAktiv;
      result.spieler.push(spieler);
    });
    result.runden = [];
    parsedJson.runden.forEach(r => {
      result.runden.push(Runde.fromJsonObject(r, result));
    });
    result.aktuelleRunde = result.runden.find(r => r.nr === parsedJson.aktuelleRunde.nr);
    return result;
  }

  public static toJSON(spieltag: Spieltag) {
    return JSON.stringify(spieltag, function replacer(key, value) {
      if (this instanceof Runde) {
        const runde = this as Runde;
        return key === "spieltag" || (key === "_ergebnisEvents" && !runde.isDummyRunde()) ? undefined : value;
      } else return value;
    });
  }

  constructor(
    public name?: string,
    public beginn?: Date,
    public runden: Array<Runde> = [],
    public aktuelleRunde?: Runde,
    public spieler: Array<Spieler> = [],
    public rules = new Rules()) { }

  public start(anzahlRunden: number, spieler: Array<Spieler>, geber: Spieler): Spieltag {
    this.beginn = new Date();
    this.spieler = spieler;
    this.spieler.forEach(s => s.isAktiv = true);
    for (let i = 0; i < anzahlRunden; i++) {
      this.runden.push(new Runde(this, i + 1));
    }
    this.aktuelleRunde = this.runden[0];
    this.aktuelleRunde.geber = geber;
    this.aktuelleRunde.spieler = this.getSpieler(geber);
    this.aktuelleRunde.aufspieler = this.getNaechstenSpieler(geber);
    this.aktuelleRunde.start();
    return this;
  }

  public startNaechsteRunde(): Spieltag {
    this.aktuelleRunde.beenden();
    const naechsteRunde = this.getNaechsteRunde(this.aktuelleRunde);
    if (naechsteRunde) {
      naechsteRunde.geber = this.aktuelleRunde.solo.regulaeresAufspiel
        ? this.getNaechstenSpieler(this.aktuelleRunde.geber) : this.aktuelleRunde.geber;
      naechsteRunde.spieler = this.getSpieler(naechsteRunde.geber);
      naechsteRunde.aufspieler = this.getNaechstenSpieler(naechsteRunde.geber);
      naechsteRunde.start();
      this.aktuelleRunde = naechsteRunde;
    }
    return this;
  }

  // Neuer Spieler sitzt hinter dem aktuellen Geber und wird zum Geber der aktuellen Runde!
  public spielerSteigtEin(neuerSpieler: Spieler): Spieltag {
    const hadPaused = this.spieler.includes(neuerSpieler);
    neuerSpieler.isAktiv = true;
    _.remove(this.spieler, s => s === neuerSpieler);
    this.spieler.splice(this.spieler.indexOf(this.aktuelleRunde.geber) + 1, 0, neuerSpieler);
    this.aktuelleRunde.geber = neuerSpieler;
    if (!hadPaused) {
      const punkte = this.lowestScoreOf(this.spieler.filter(s => s !== neuerSpieler));
      this.insertDummyRundeWith(neuerSpieler, punkte,
        `${neuerSpieler.name} steigt mit ${punkte} ${punkte === 1 ? "Punkt" : "Punkten"} ein`);
    }
    return this;
  }

  public spielerSteigtAus(aussteiger: Spieler): Spieltag {
    aussteiger.isAktiv = false;
    if (this.aktuelleRunde.geber === aussteiger) {
      this.aktuelleRunde.geber = this.getVorherigenSpieler(aussteiger);
    }
    this.aktuelleRunde.aufspieler = this.getNaechstenSpieler(this.aktuelleRunde.geber);
    this.aktuelleRunde.spieler = this.getSpieler(this.aktuelleRunde.geber);
    return this;
  }

  public setzeRundenanzahl(anzahl: number): Spieltag {
    if (this.runden.length < anzahl) {
      _.times(anzahl - this.runden.length, i => this.runden.push(new Runde(this, this.runden.length + 1)));
    } else if (this.runden.length > anzahl) {
      this.runden.splice(anzahl);
    }
    // Falls letzte Runde bereits gespielt, neue Runde beginnen
    if (this.aktuelleRunde.isBeendet) {
      this.startNaechsteRunde();
    }
    return this;
  }

  public bock(): Spieltag {
    this.doBoecke(1);
    return this;
  }

  public boecke(): Spieltag {
    this.doBoecke(this.getAktiveSpieler().length);
    return this;
  }

  public undoBoecke(anzahlBoecke: number): Spieltag {
    if (this.rules.maxBoeckeAtStart > 0) {
      _.times(anzahlBoecke, i => {
        let runde = _.findLast(this.runden, r => r.boecke === 2 && !r.isBeendet);
        if (!runde) runde = _.findLast(this.runden, r => r.boecke === 1 && !r.isBeendet);
        if (runde) runde.boecke--;
      });
    }
    return this;
  }

  public undoLetzteRunde(): Spieltag {
    this.aktuelleRunde.reset();
    this.aktuelleRunde = this.getVorherigeRunde(this.aktuelleRunde).undoBoecke().reset().start();
    return this;
  }

  public getAktiveSpieler() {
    return this.spieler.filter(s => s.isAktiv);
  }

  public findSpielerById(id: number) {
    return this.spieler.find(s => s.id === id);
  }

  public getPunktestand(runde: Runde, spieler: Spieler) {
    return this.runden.slice(0, this.runden.indexOf(runde) + 1)
      .filter(r => r.gewinner.includes(spieler))
      .map(r => r.ergebnis)
      .reduce((acc, curr) => acc + curr, 0);
  }

  public getVorherigeRunde(runde: Runde) {
    const indexOfRunde = this.runden.indexOf(runde);
    return indexOfRunde > 0 ? this.runden[indexOfRunde - 1] : undefined;
  }

  public getNaechsteRunde(runde: Runde) {
    const indexOfRunde = this.runden.indexOf(runde);
    return indexOfRunde < this.runden.length - 1 ? this.runden[indexOfRunde + 1] : undefined;
  }

  public getAktuelleSitzreihenfolgeAsHTMLString() {
    // Spieler am Tisch
    let result = "<br>Am Tisch:<br>" + this.aktuelleRunde.spieler.map(s => {
      if (this.aktuelleRunde.geber === s) {
        return `<b>${s.name}</b> (Geber)`;
      } else if (this.aktuelleRunde.aufspieler === s) {
        return `<b>${s.name}</b> (Aufspiel)`;
      } else {
        return `<b>${s.name}</b>`;
      }
    }).join(" - ");
    // Spieler, die draußen warten
    const notPlaying = _.difference(this.getAktiveSpieler(), this.aktuelleRunde.spieler);
    if (!_.isEmpty(notPlaying)) {
      result += "<br><br>Nicht am Tisch:<br>" + notPlaying.map(s => {
        let _result = `<b>${s.name}</b>`;
        if (this.aktuelleRunde.geber === s) {
          _result += " (Geber";
          _result += notPlaying.length === 2 ? ")" : `, kommt rein für ${this.aktuelleRunde.aufspieler.name})`;
        } else {
          _result += ` (kommt rein für ${this.aktuelleRunde.aufspieler.name})`;
        }
        return _result;
      }).join(" - ");
    }
    return result;
  }

  private insertDummyRundeWith(spieler: Spieler, punkte: number, description: string) {
    const dummyRunde = new Runde(this, this.aktuelleRunde.nr);
    dummyRunde.spieler = [spieler];
    dummyRunde.gewinner = [spieler];
    dummyRunde.ergebnis = punkte;
    dummyRunde.setErgebnisEvents([{"event": description, "icon": "pi-info"}]);
    dummyRunde.isGestartet = true;
    dummyRunde.isBeendet = true;
    // adjust nr of following Runden
    this.runden.slice(dummyRunde.nr - 1).forEach(r => r.nr++);
    // insert new Runde
    this.runden.splice(dummyRunde.nr - 1, 0, dummyRunde);
  }

  private lowestScoreOf(spieler: Array<Spieler>) {
    return _.min(spieler.map(s => this.getPunktestand(this.aktuelleRunde, s)));
  }

  private doBoecke(count: number) {
    let nextBockableRunde = this.findNextBockableRunde();
    if (!nextBockableRunde) {
      return;
    }
    for (let i = count; i > 0; i--) {
      nextBockableRunde.addBock();
      nextBockableRunde = this.getNaechsteRunde(nextBockableRunde);
      if (!nextBockableRunde) {
        this.doBoecke(i - 1);
        break;
      }
    }
  }

  private findNextBockableRunde() {
    const indexOfAktuelleRunde = this.runden.indexOf(this.aktuelleRunde);
    if (indexOfAktuelleRunde === this.runden.length - 1) {
      return undefined;
    } else {
      return this.runden.slice(indexOfAktuelleRunde + 1).find(r => r.boecke < this.rules.maxBoeckeAtStart);
    }
  }

  private getSpieler(geber: Spieler): Array<Spieler> {
    const result = [];
    let _spieler = geber;
    for (let i = 0; i < 4; i++) {
      _spieler = this.getNaechstenSpieler(_spieler);
      result.push(_spieler);
    }
    return result;
  }

  private getNaechstenSpieler(spieler: Spieler) {
    const i = this.spieler.indexOf(spieler);
    const next = i === this.spieler.length - 1 ? this.spieler[0] : this.spieler[i + 1];
    return next.isAktiv ? next : this.getNaechstenSpieler(next);
  }

  private getVorherigenSpieler(spieler: Spieler) {
    const previous = _.nth(this.spieler, this.spieler.indexOf(spieler) - 1);
    return previous.isAktiv ? previous : this.getVorherigenSpieler(previous);
  }

}


