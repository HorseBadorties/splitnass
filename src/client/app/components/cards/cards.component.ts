import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, QueryList } from '@angular/core';

import Deck from 'deck-of-cards';

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
        card.enableFlipping();
      });
      deck.mount(this.container.first.nativeElement);
    }
  }

  ngOnInit() {
  }

}
