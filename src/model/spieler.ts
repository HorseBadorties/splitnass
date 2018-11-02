
export class Spieler  {

  public static all =  [
    new Spieler(1, "Claus"),
    new Spieler(2, "Guido"),
    new Spieler(3, "Levent"),
    new Spieler(4, "Ralf"),
    new Spieler(5, "Torsten"),
    new Spieler(9, "Thomas")];

  public static get(id: number): Spieler {
    return this.all.find(s => s.id === id);
  }

  constructor(public id: number, public name: string, public isAktiv = true) { }

  toString() {
    return `${this.id} -  ${this.name}`;
  }

}

