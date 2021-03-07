import { shuffle, orderBy } from "lodash-es";

import { Card, Suit, Rank } from "./card";

export class Deck {

  public cards: Array<Card>;
  public playedCards: Array<Card>;

  static doppelkopfDeck(): Array<Card> {
    function deck() {
      const result = [];
      [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS].forEach(suit => {
        [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE].forEach(rank => {
          result.push(new Card(rank, suit));
        });
      });
      return result;
    }
    return deck().concat(deck());
  }

  constructor(cards: Array<Card>) {
    this.cards = cards ? cards : [];
    this.playedCards = [];
  }

  public shuffle(): Deck {
    this.cards = shuffle(this.cards);
    return this;
  }

  public sort(): Deck {
    this.cards = orderBy(this.cards, card => card.sortValue(this), "desc");
    return this;
  }

  public deal(): Array<Hand> {
    return [
      new Hand(this.cards.slice(0, 10)),
      new Hand(this.cards.slice(10, 20)),
      new Hand(this.cards.slice(20, 30)),
      new Hand(this.cards.slice(30, 40))
    ];
  }

  public play(card: Card): Card {
    if (!this.cards.includes(card)) {
      throw new Error(`${card} not in the deck`);
    }
    this.cards.splice(this.cards.indexOf(card), 1);
    this.playedCards.push(card);
    return card;
  }

  public cardsOf(suit: Suit): Array<Card> {
    return this.cards.filter(c => c.suit === suit);
  }

  public trumps(): Array<Card> {
    return this.cards.filter(c => c.isTrump());
  }

}
export class Hand extends Deck {

  constructor(cards: Array<Card>) {
    super(cards);
  }

  public lead(): Card {
    return this.cards[0];
  }

  public followSuit(trick: Array<Card>): Card {
    return this.cards[0];
  }

}

