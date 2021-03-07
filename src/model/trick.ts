import { isEmpty } from "lodash-es";
import { CardPlayed } from "./cardPlayed";

export class Trick {

  public cardsPlayed: Array<CardPlayed>;

  constructor() {
    this.cardsPlayed = [];
  }

  add(card: CardPlayed) {
    this.cardsPlayed.push(card);
  }

  leadCard(): CardPlayed {
    return isEmpty(this.cardsPlayed) ? undefined : this.cardsPlayed[0];
  }

}
