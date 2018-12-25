import { Deck } from "./deck";

export class Card {

    // e.g. Card.of("Q♥") or Card.of("10H")
    static of(value: string): Card {
        return new Card(this.rankOf(value), this.suitOf(value));
    }

    private static suitOf(value: string): Suit {
        switch (value.charAt(value.length - 1)) {
            case "S":
            case "♠︎": return Suit.SPADES;
            case "H":
            case "♥": return Suit.HEARTS;
            case "C":
            case "♣": return Suit.CLUBS;
            case "D":
            case "♦︎": return Suit.DIAMONDS;
        }
    }

    private static rankOf(value: string): Rank {
        switch (value.substring(0, value.length - 1)) {
            case "10": return Rank.TEN;
            case "J": return Rank.JACK;
            case "Q": return Rank.QUEEN;
            case "K": return Rank.KING;
            case "A": return Rank.ACE;
        }
    }

    private static isTenOfHearts(card: Card) {
        return card.rank === Rank.TEN && card.suit === Suit.HEARTS;
    }


    constructor(public rank: Rank, public suit: Suit) {}

    public toString(): string {
        return `${this.rank}${this.suit}`;
    }

    public isTrump() {
        return this.rank === Rank.QUEEN
            || this.rank === Rank.JACK
            || this.suit === Suit.DIAMONDS
            || Card.isTenOfHearts(this);
    }

    public sortValue(deck: Deck): number {
        const suitValue = () => {
            switch (this.suit) {
                case Suit.CLUBS: return 4;
                case Suit.SPADES: return 3;
                case Suit.HEARTS: return 2;
                case Suit.DIAMONDS: return 1;
        }};
        const rankValue = () => {
            switch (this.rank) {
                case Rank.QUEEN: return 5;
                case Rank.JACK: return 4;
                case Rank.ACE: return 3;
                case Rank.TEN: return 2;
                case Rank.KING: return 1;
        }};
        const isAceOfDiamonds = _card =>
            _card.rank === Rank.ACE && _card.suit === Suit.DIAMONDS;
        const isSau = _card =>
            isAceOfDiamonds(_card) && deck.cards.filter(c => isAceOfDiamonds(c)).length === 2;
        const valueOf = rankAndSuit =>
            Card.of(rankAndSuit).sortValue(deck);
        const trumpValue = () => {
            if (Card.isTenOfHearts(this)) return  valueOf("Q♣") + 1;
            if (this.rank === Rank.QUEEN) return 2000 + suitValue();
            if (this.rank === Rank.JACK) return 1000 + suitValue();
            return 100 + rankValue() ;
        };

        if (isSau(this)) return valueOf("10♥") + 1;
        else return this.isTrump() ? trumpValue() : 10 * suitValue() + rankValue();
    }

}

export enum Rank {
    TEN = "10",
    JACK = "J",
    QUEEN = "Q",
    KING = "K",
    ACE = "A"
}

export enum Suit {
    SPADES = "♠︎",
    HEARTS = "♥",
    CLUBS = "♣",
    DIAMONDS = "♦︎"
}



