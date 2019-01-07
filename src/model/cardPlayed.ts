import { Player } from "./player";
import { Card } from "./card";

export class CardPlayed {
  constructor(public player: Player, public card: Card) {}
}
