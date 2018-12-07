import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, QueryList } from '@angular/core';

import Deck from 'deck-of-cards';

import * as _ from "lodash";

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit, AfterViewInit {

  deck: Deck;

  @ViewChildren("container", { read: ElementRef }) container: QueryList<ElementRef>;

  ngAfterViewInit() {
    if (this.container.first.nativeElement) {
      this.newDeck();
    }
  }

  private newDeck() {
    const self = this;

    if (self.deck) {
      self.deck.cards.forEach((card, i) => card.unmount());        
      self.deck.unmount();
    }

    console.log("mounting deck of cards");
    self.deck = self.doppelkopfDeck();      
    _.times(3, () => self.deck.shuffle());
    // deal a hand
    _.remove(self.deck.cards, (_card, i, a) => {
      if (i >= 10) {
        _card["unmount"]();
        return true;
      } else return false;
    });
    let lastZ = 0;
    self.deck.queue(next => {
      self.sort(self.deck);
      self.deck.cards.forEach((card, i) => {          
        card.$el.addEventListener('click', onClick);
        card.setSide('front');

        function onClick() {    
          self.deck.queue(next => {
            card.$el.style.zIndex = 10;
            card.animateTo({
              delay: 100, duration: 500, x: -300, y: -300,
              onComplete: () => card.$el.style.zIndex = lastZ++
            });
                      
            next();
          });
        }
      });
      self.deck.fan();
      next();
    });      
    self.deck.mount(self.container.first.nativeElement);
    console.log(self.deck.cards);

  }

  private doppelkopfDeck() {
    const result = Deck();
    const removed = _.remove(result.cards, (card, i, a) => {
      if (card["rank"] > 1 && card["rank"] < 10) {
        card["unmount"]();
        return true;
      } else return false;
    });
    
    result.cards.forEach((card, i) => {
      const newCard = removed.pop();
      newCard["rank"] = card.rank;
      newCard["suit"] = card.suit;
      result.cards.push(newCard);
      newCard["mount"](this.container.first.nativeElement);
      
    });
    return result;
  }

  private sort(deck: Deck) {
    deck.cards = _.orderBy(deck.cards, card => valueOf(card, deck), "desc");
    deck.cards.forEach((card, i) => card.pos = i);  

    function valueOf(card: any, deck: Deck) {
      if (isTrump(card)) {
        if (card.suit == 3 && card.rank == 1) { // Karo-Ass
          return deck.cards.filter(_card => _card.suit == 3 && _card.rank == 1).length === 2 ? 20000 : trumpValue(card);
        } else if (card.suit == 1 && card.rank == 10) { // Herz 10
          return 10000;
        } else {
          return trumpValue(card);
        }
      } else {
        return 100 * suit(card) + 10 * rank(card)
      }      

      function trumpValue(card) {
        if (card.rank == 12) return 2000 + suit(card); 
        if (card.rank == 11) return 1000 + suit(card); 
        return 700 + rank(card) ;
      }

      function rank(card) {
        switch (card.rank) {
          case 1: return 3; // Ass
          case 10: return 2; // 10
          case 11: return 4; // Bube
          case 12: return 5; // Dame
          case 13: return 1; // König
        }
      }

      function suit(card) {
        switch (card.suit) {
          case 0: return 3; // Pik
          case 1: return 2; // Herz
          case 2: return 4; // Kreuz
          case 3: return 1; // Karo
        }
      }

      function isTrump(card) {
        return card.rank == 11 || card.rank == 12 || card.suit == 3 || (card.suit == 1 && card.rank == 10);
      }
    }

  }

  deal() {
    this.newDeck();
  }
  

  ngOnInit() {
  }

}
