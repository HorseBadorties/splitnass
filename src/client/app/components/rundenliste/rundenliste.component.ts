import { Component, ViewChildren, QueryList, ElementRef, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { take } from "rxjs/operators";
import * as _ from "lodash";
import smoothscroll from "smoothscroll-polyfill";

import { Spieltag } from "src/model/spieltag";
import { Runde } from "src/model/runde";
import { SpieltagService } from "../../services/spieltag.service";
import { SettingsService } from "../../services/settings.service";
import { DialogService } from "../../dialogs/dialog.service";
import { SettingsComponent } from "../../dialogs/settings/settings.component";
import { MenuItem } from "primeng/api";
import { SpieltagauswahlComponent } from "../../dialogs/spieltagauswahl/spieltagauswahl.component";

smoothscroll.polyfill();

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
  displayMenu = false;
  menuItems: MenuItem[];
  @ViewChildren("primerow", { read: ElementRef }) rowsPrime: QueryList<ElementRef>;

  constructor(
    public spieltagService: SpieltagService,
    public settingsService: SettingsService,
    private router: Router,
    private dialogService: DialogService) {}


  onSwipeLeft(evt) {
    this.toRunde();
  }
  onSwipeRight(evt) {
    this.toRunde();
  }
  
  openSettings() {
    this.displayMenu = false;
    this.dialogService.open(SettingsComponent, {});
  }

  toCharts() {
    this.displayMenu = false;
    this.router.navigate(["charts"], { skipLocationChange: false });
  }

  toRunde() {
    if (this.settingsService.adminMode) {
      setTimeout(() => this.router.navigate(["runde"], {skipLocationChange: false}), 50);
    }
  }

  spieltagAuswahl() {
    this.displayMenu = false;
    this.spieltagService.listSpieltage().pipe(take(1)).subscribe(list => {
      const data: any = {
        spieltage: list, 
        message: "Welcher Spieltag soll angezeigt werden?"
      };
      this.dialogService.open(SpieltagauswahlComponent, data);
    });
    
  }
  
  getSpieltagInfo() {
    return this.spieltag ? this.spieltag.name : `no Spieltag`;
  }

  ngOnInit() {
    this.initMenu();
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
      if (spieltag.aktuelleRunde.nr > 1) {
        const vorherigeRunde = spieltag.getVorherigeRunde(spieltag.aktuelleRunde);
        if (this.settingsService.autoShowRundendetails) {
          this.expandedRunden[vorherigeRunde.nr] = 1;
        }
        setTimeout(() => this.scrollToRunde(vorherigeRunde), 500);
      }
    }
  }

  ngAfterViewInit() {
    if (this.selectedRunde) {
      this.scrollToRunde(this.selectedRunde);
    }
   }

  private calcDisplayedColumns(s: Spieltag) {
    const result = [new Column("nr", "Runde", "60%")];
    s.spieler
      .filter(s => this.settingsService.hideInactivePlayers ? s.isAktiv : true)
      .forEach(spieler => result.push(new Column(spieler.id.toString(), spieler.name, "100%", spieler.isAktiv)));
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

  private initMenu() {
    this.menuItems = [
      {
        label: "Charts", id: MenuItemId.Charts,
        icon: "pi pi-fw pi-chart-bar", command: _ => this.toCharts()
      },
      {
        label: "Settings", id: MenuItemId.Settings,
        icon: "pi pi-fw pi-cog", command: _ => this.openSettings()
      },
      {
        label: "Spieltag wechseln", id: MenuItemId.Settings,
        icon: "pi pi-fw pi-calendar-times", command: _ => this.spieltagAuswahl()
      },
    ];
  }

}

enum MenuItemId {
  Settings = "Settings",
  Charts = "Charts"
}

export class Column {
  constructor(public field: String, public header: String, public width: String, public isActive = true) {}
}
