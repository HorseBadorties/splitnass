import * as _ from "lodash";
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
    return _.isEmpty(this.cardsPlayed) ? undefined : this.cardsPlayed[0];
  }

}
