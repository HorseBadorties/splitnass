import * as _ from "lodash";

import { Card, Suit, Rank } from "./card";
import { Subscriber } from "rxjs";

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
        this.cards = _.shuffle(this.cards);
        return this;
    }

    public sort(): Deck {
        this.cards = _.orderBy(this.cards, card => card.sortValue(this), "desc");
        return this;
    }

    public deal(): Array<Deck> {
        const dealOne = (hand: Deck) => {
            hand.cards.push(this.play(this.cards[0]));
        };
        const hand1 = new Deck(null);
        const hand2 = new Deck(null);
        const hand3 = new Deck(null);
        const hand4 = new Deck(null);
        _.times(10, n => {
            dealOne(hand1);
            dealOne(hand2);
            dealOne(hand3);
            dealOne(hand4);
        });
        return [hand1.sort(), hand2.sort(), hand3.sort(), hand4.sort()];
    }

    public play(card: Card): Card {
        if (!this.cards.includes(card)) {
            throw new Error(`${card} not in the deck`);
        }
        this.cards.splice(this.cards.indexOf(card), 1);
        this.playedCards.push(card);
        return card;
    }
}

new Deck(Deck.doppelkopfDeck()).shuffle().deal().forEach(aHand => {
    console.log(aHand.cards.map(c => c.toString()).join(", "));
});

