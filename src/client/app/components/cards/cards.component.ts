import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, QueryList } from '@angular/core';

import Deck from 'deck-of-cards';

import * as _ from "lodash";

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit, AfterViewInit {

  @ViewChildren("container", { read: ElementRef }) container: QueryList<ElementRef>;

  ngAfterViewInit() {
    if (this.container.first.nativeElement) {
      console.log("mounting deck of cards");
      const deck = Deck(0);
      deck.cards.forEach(card => {
        card.enableDragging();
        //card.enableFlipping();
      });
      deck.mount(this.container.first.nativeElement);
      const removed = _.remove(deck.cards, (card, i, a) => {
        if (card["rank"] > 1 && card["rank"] < 10) {
          card["unmount"]();
          return true;
        } else return false;
      });
      deck.cards.forEach(card => {
        const newCard = removed.pop();
        newCard["rank"] = card["rank"];
        newCard["suit"] = card["suit"];
        deck.cards.push(newCard);
        newCard["mount"](this.container.first.nativeElement);

      }); 
      deck.cards.forEach(card => card["setSide"]('front'));    
      deck.shuffle();
      deck.shuffle();
      deck.shuffle();
      deck.fan();
      console.log(deck.cards);
      
    }
  }

  ngOnInit() {
  }

}
