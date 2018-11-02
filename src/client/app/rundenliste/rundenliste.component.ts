import { Component, ViewChildren, QueryList, ElementRef, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { Subscription  } from "rxjs";

import { Spieltag } from "../../../model/spieltag";
import { Runde } from "../../../model/runde";
import { SpieltagService } from "../services/spieltag.service";
import { SocketService } from "../services/socket.service";

@Component({
  selector: "app-rundenliste",
  templateUrl: "./rundenliste.component.html",
  styleUrls: ["./rundenliste.component.css"]
})
export class RundenlisteComponent implements OnInit, AfterViewInit, OnDestroy {

  subscribtion: Subscription;
  spieltag: Spieltag;
  selectedRunde: Runde;
  displayMenu = false;
  displayedColumns: Column[];
  // https://netbasal.com/understanding-viewchildren-contentchildren-and-querylist-in-angular-896b0c689f6e
  @ViewChildren("primerow", { read: ElementRef }) rowsPrime: QueryList<ElementRef>;

  constructor(
    public spieltagService: SpieltagService,
    public socketService: SocketService) {}

  getSpieltagInfo() {
    return this.spieltag ? `Spieltag vom ${this.formatDate(this.spieltag.beginn)}` : `no Spieltag`;
  }

  ngOnInit() {
    // this.spieltagService.getAktuellerSpieltag().subscribe(spieltag => this.setSpieltag(spieltag));
    this.subscribtion = this.socketService.updatedSpieltag.subscribe(spieltag => this.setSpieltag(spieltag));
  }

  ngOnDestroy() {
    if (this.subscribtion) {
      this.subscribtion.unsubscribe();
    }
  }

  private setSpieltag(spieltag: Spieltag) {
    this.spieltag = spieltag;
    if (spieltag) {
      this.calcDisplayedColumns(spieltag);
      this.selectedRunde = spieltag.aktuelleRunde;
      this.scrollToRunde(this.selectedRunde);
    }
  }

  ngAfterViewInit() {
    if (this.spieltag) {
      this.scrollToRunde(this.spieltag.aktuelleRunde);
    }
   }

  private calcDisplayedColumns(s: Spieltag) {
    const result = [new Column("nr", "Runde", "60%")];
    s.spieler.forEach(spieler => result.push(new Column(spieler.id.toString(), spieler.name, "100%")));
    result.push(new Column("boecke", "Böcke", "60%"));
    result.push(new Column("ergebnis", "Punkte", "60%"));
    this.displayedColumns = result;
  }

  getValueFor(runde: Runde, field: string) {
    switch (field) {
      case "nr": return runde.nr;
      case "boecke": return "|".repeat(runde.boecke);
      case "ergebnis": return runde.ergebnis > 0 ? runde.ergebnis.toString() : "";
      default: {
        const spieler = this.spieltag.spieler.find(s => s.id === Number.parseInt(field));
        if (runde.isAktuelleRunde()) {
          if (runde.geber === spieler) {
            return "Geber";
          } else if (runde.aufspieler === spieler) {
            return "Aufspiel";
          }
        } else if (runde.isGespielteRunde()) {
          if (runde.spieler.includes(spieler)) {
            if (runde.gewinner.includes(spieler)) {
              return this.spieltag.getPunktestand(runde, spieler).toString();
            } else {
              return "*";
            }
          } else {
            return "-";
          }
        }
        return "";
      }
    }
  }

  getIndex(index: number, item: Runde) {
    return item.nr;
  }

  rundeClicked(runde: Runde) {
    this.spieltagService.selectedRunde = runde;
  }

  scrollToRunde(runde: Runde) {
    if (runde) {
      if (this.selectedRunde !== runde) {
        this.selectedRunde = runde;
      }
      this.scrollToNr(runde.nr.toString());
    }
  }

  formatDate(date: Date) {
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1; // getMonth() is zero-based
    const dd  = date.getDate();
    return dd.toString() + "." + mm.toString() + "." + yyyy.toString();
  }

  private scrollToNr(nr: string) {
    if (this.rowsPrime) {
      this.scrollTo(this.rowsPrime.find(r => r.nativeElement.getAttribute("nr") === nr));
    }
  }

  private scrollTo(row: ElementRef) {
    if (row != null) {
      row.nativeElement.scrollIntoView(false, {behavior: "smooth"});
    }
  }

}

export class Column {
  constructor(public field: String, public header: String, public width: String) {}
}
