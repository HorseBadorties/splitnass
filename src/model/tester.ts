import * as _ from "lodash";
import { Deck } from "./hand";
import { Player } from "./player";

const hands = new Deck(Deck.doppelkopfDeck()).shuffle().deal();
_.map(_.each(hands, hand => hand.sort()), (hand, index) => new Player(index, hand))
  .forEach(aPlayer => {
    console.log(`Hand ${aPlayer.position}: ${aPlayer.hand.cards.map(c => c.toString()).join(", ")}`);
  });
