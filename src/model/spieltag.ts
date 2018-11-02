import { Runde, MAX_BOECKE } from "./runde";
import { Spieler } from "./spieler";

export class Spieltag {

  public static fromJSON(jsonString: string) {
    const result = new Spieltag();
    const parsedJson = JSON.parse(jsonString, function replacer(key, value) {
      return (key === "xyz") ? undefined : value;
    });
    result.key = parsedJson.key;
    result.beginn = parsedJson.beginn ? new Date(parsedJson.beginn) : undefined;
    result.ende = parsedJson.ende ? new Date(parsedJson.ende) : undefined;
    result.spieler = [];
    parsedJson.spieler.forEach(s => {
      result.spieler.push(Spieler.get(s.id));
    });
    result.anzahlRunden = parsedJson.anzahlRunden;
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
        return (key === "spieltag") ? undefined : value;
      } else return value;
    });
  }

  constructor(
      public key?: string,
      public beginn?: Date,
      public ende?: Date,
      public anzahlRunden = 0,
      public runden: Array<Runde> = [],
      public aktuelleRunde?: Runde,
      public spieler: Array<Spieler> = []) {}

  start(anzahlRunden: number, spieler: Array<Spieler>, geber: Spieler) {
    this.beginn = new Date();
    this.spieler = spieler;
    this.anzahlRunden = anzahlRunden;
    for (let i = 0; i < this.anzahlRunden; i++) {
      this.runden.push(new Runde(this, i + 1));
    }
    this.aktuelleRunde = this.runden[0];
    this.aktuelleRunde.geber = geber;
    this.aktuelleRunde.spieler = this.getSpieler(geber);
    this.aktuelleRunde.aufspieler = this.getNaechstenSpieler(geber);
    this.aktuelleRunde.start();
  }

  startNaechsteRunde() {
    const naechsteRunde = this.getNaechsteRunde(this.aktuelleRunde);
    naechsteRunde.geber = this.aktuelleRunde.solo.regulaeresAufspiel
      ? this.getNaechstenSpieler(this.aktuelleRunde.geber) : this.aktuelleRunde.geber;
    naechsteRunde.spieler = this.getSpieler(naechsteRunde.geber);
    naechsteRunde.aufspieler = this.getNaechstenSpieler(naechsteRunde.geber);
    this.aktuelleRunde.beenden();
    naechsteRunde.start();
    this.aktuelleRunde = naechsteRunde;
  }

  public bock() {
    this.doBoecke(1);
  }

  public boecke() {
    this.doBoecke(this.spieler.length);
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
      return this.runden.slice(indexOfAktuelleRunde + 1).find(r => r.boecke < MAX_BOECKE - 1);
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
}

