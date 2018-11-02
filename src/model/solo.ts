export class Solo {

    private constructor(
        readonly id: number,
        readonly name: string,
        readonly regulaeresAufspiel: boolean,
        readonly sauMoeglich: boolean,
        readonly gegenDieAltenMoeglich: boolean) { }

    public static KEIN_SOLO = new Solo(0, "<kein Solo>", true, true, true);
    public static FLEISCHLOS = new Solo(1, "Fleischlos", false, false, false);
    public static DAMENSOLO = new Solo(2, "Damensolo", false, false, false);
    public static BAUERNSOLO = new Solo(3, "Bauernsolo", false, false, false);
    public static FARBENSOLO = new Solo(4, "Farbensolo", false, false, false);
    public static TRUMPFSOLO = new Solo(5, "Trumpfsolo", false, true, false);
    public static NULL = new Solo(6, "Null", true, false, false);
    public static STILLES_SOLO = new Solo(7, "Stilles Solo", true, true, true);

    public static get(id: number): Solo {
        switch (id) {
            case 0: return this.KEIN_SOLO;
            case 1: return this.FLEISCHLOS;
            case 2: return this.DAMENSOLO;
            case 3: return this.BAUERNSOLO;
            case 4: return this.FARBENSOLO;
            case 5: return this.TRUMPFSOLO;
            case 6: return this.NULL;
            case 7: return this.STILLES_SOLO;
        }
    }

    toJSON() {
      return this.id;
    }

    toString() {
        return this.name;
    }
}
