import { Component, ViewChildren, QueryList, ElementRef, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { ScrollableView } from "primeng/table";
import ResizeObserver from "resize-observer-polyfill";
import { Subscription  } from "rxjs";
import * as _ from "lodash";

import { Spieltag } from "src/model/spieltag";
import { Runde } from "src/model/runde";
import { SpieltagService } from "../../services/spieltag.service";
import { SettingsService } from "../../services/settings.service";
import { DialogService } from "../../dialog/dialog.service";
import { SettingsComponent } from "../settings/settings.component";

/** Hack: align header */
ScrollableView.prototype.ngAfterViewChecked = function () {
  if (!this.initialized && this.el.nativeElement.offsetParent) {
    //this.alignScrollBar();
    this.initialized = true;

    new ResizeObserver(entries => {
      //for (let entry of entries)
        this.alignScrollBar();
    }).observe(this.scrollBodyViewChild.nativeElement);
  }
};

@Component({
  selector: "app-rundenliste",
  templateUrl: "./rundenliste.component.html",
  styleUrls: ["./rundenliste.component.css"]
})
export class RundenlisteComponent implements OnInit, AfterViewInit, OnDestroy {

  subscribtion: Subscription;
  spieltag: Spieltag;
  selectedRunde: Runde;
  expandedRunden = [];
  displayedColumns: Column[];
  // https://netbasal.com/understanding-viewchildren-contentchildren-and-querylist-in-angular-896b0c689f6e
  @ViewChildren("primerow", { read: ElementRef }) rowsPrime: QueryList<ElementRef>;

  constructor(
    public spieltagService: SpieltagService,
    public settingsService: SettingsService,
    private router: Router,
    private dialogService: DialogService) {}

  openDialog() {
    const ref = this.dialogService.open(SettingsComponent, { data: { message: 'I am a dynamic component inside of a dialog!' } });
    ref.afterClosed.subscribe(result => {
      console.log('Dialog closed', result);
    });
  }

  toRunde() {
    if (this.settingsService.adminMode) {
      setTimeout(() => this.router.navigate(["runde"], {skipLocationChange: false}), 50);
    }
  }
  
  getSpieltagInfo() {
    return this.spieltag ? `Spieltag vom ${this.formatDate(this.spieltag.beginn)}` : `no Spieltag`;
  }

  ngOnInit() {
    this.subscribtion = this.spieltagService.spieltag.subscribe(spieltag => this.setSpieltag(spieltag));
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
      this.expandedRunden = [];
      if (spieltag.aktuelleRunde.nr > 1 && this.settingsService.autoShowRundendetails) {
        this.expandedRunden[spieltag.getVorherigeRunde(spieltag.aktuelleRunde).nr] = 1;
      }
      setTimeout(() => this.scrollToRunde(spieltag.aktuelleRunde), 500);
    }
  }

  ngAfterViewInit() {
    if (this.selectedRunde) {
      this.scrollToRunde(this.selectedRunde);
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
    this.expandedRunden[runde.nr] = this.expandedRunden[runde.nr] === 1 ? 0 : 1;
  }

  scrollToRunde(runde: Runde) {
    if (runde) {      
      this.scrollToNr(runde.nr.toString());
    }
  }

  formatDate(date: Date) {
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1; // getMonth() is zero-based
    const dd  = date.getDate();
    return _.padStart(dd.toString(), 2, "0") + "." + _.padStart(mm.toString(), 2, "0") + "." + yyyy.toString();
  }

  private scrollToNr(nr: string) {
    if (this.rowsPrime) {
      this.scrollTo(this.rowsPrime.find(r => r.nativeElement.getAttribute("nr") === nr));
    }
  }

  private scrollTo(row: ElementRef) {
    if (row != null) {
      row.nativeElement.scrollIntoView({behavior: "smooth", inline: "center", block: "center"});
    }
  }

}

export class Column {
  constructor(public field: String, public header: String, public width: String) {}
}
