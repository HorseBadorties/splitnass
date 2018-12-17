import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { MenuItem } from "primeng/api";
import { Subscription } from "rxjs";
import { take } from "rxjs/operators";
import smoothscroll from "smoothscroll-polyfill";
import { Runde } from "src/model/runde";
import { Spieltag } from "src/model/spieltag";
import { DialogService } from "primeng/api";
import { SettingsComponent } from "../../dialogs/settings/settings.component";
import { SpieltagauswahlComponent } from "../../dialogs/spieltagauswahl/spieltagauswahl.component";
import { SettingsService } from "../../services/settings.service";
import { SpieltagService } from "../../services/spieltag.service";


smoothscroll.polyfill();

@Component({
  // encapsulation: ViewEncapsulation.None,
  selector: "app-rundenliste",
  templateUrl: "./rundenliste.component.html",
  styleUrls: ["./rundenliste.component.css"],
  providers: [DialogService]
})
export class RundenlisteComponent implements OnInit, AfterViewInit, OnDestroy {

  spieltagSubscribtion: Subscription;
  statusSubscribtion: Subscription;
  onlineStatus = "";
  spieltag: Spieltag;
  selectedRunde: Runde;
  expandedRunden = [];
  displayedColumns: Column[];
  displayMenu = false;
  menuItems: MenuItem[];
  @ViewChildren("row", { read: ElementRef }) rowElement: QueryList<ElementRef>;
  @ViewChildren("rowDetail", { read: ElementRef }) rowDetailElement: QueryList<ElementRef>;
  private shouldPulse = false;

  constructor(
    public spieltagService: SpieltagService,
    public settingsService: SettingsService,
    private router: Router,
    private dialogService: DialogService) {}

  ngOnInit() {
    this.initMenu();
    this.spieltagSubscribtion = this.spieltagService.spieltag.subscribe(spieltag => this.setSpieltag(spieltag));
    this.statusSubscribtion = this.spieltagService.online.subscribe(online => this.onlineStatus = online ? "" : "offline");    
  }

  ngAfterViewInit() {
    if (this.selectedRunde) {
      this.scrollToRunde(this.selectedRunde);
    } 
  }

  ngOnDestroy() {
    if (this.spieltagSubscribtion) {
      this.spieltagSubscribtion.unsubscribe();
    }
    if (this.statusSubscribtion) {
      this.statusSubscribtion.unsubscribe();
    }
  }


  onSwipeLeft(evt) {
    this.toRunde();
  }
  onSwipeRight(evt) {
    this.toRunde();
  }
  
  openSettings() {
    this.displayMenu = false;
    this.dialogService.open(SettingsComponent, { showHeader: false });
  }

  toCurrentCharts() {
    this.displayMenu = false;
    this.router.navigate(["currentcharts"], { skipLocationChange: false });
  }

  toGlobalCharts() {
    this.displayMenu = false;
    this.router.navigate(["globalcharts"], { skipLocationChange: false });
  }

  toRunde() {
    if (this.settingsService.adminMode) {
      setTimeout(() => this.router.navigate(["runde"], {skipLocationChange: false}), 50);
    }
  }

  spieltagAuswahl() {
    this.displayMenu = false;
    this.spieltagService.listSpieltage().pipe(take(1)).subscribe(list => {
      const config: any = {
        showHeader: false,
        data: {
          spieltage: list, 
          message: "Welcher Spieltag soll angezeigt werden?"
        }
      };
      this.dialogService.open(SpieltagauswahlComponent, config);
    });
    
  }
  
  getSpieltagInfo() {
    return this.spieltag ? this.spieltag.name : `no Spieltag`;
  }

  private setSpieltag(spieltag: Spieltag) {
    this.shouldPulse = this.spieltag !== undefined; // beim ersten Anzeigen nicht pulsieren
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
    } else if (spieltag === null) {
      this.spieltagAuswahl();
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
    if (this.rowElement) {
      const rowByNr = this.rowElement.find(r => r.nativeElement.getAttribute("nr") === nr);
      this.scrollTo(rowByNr);
      if (this.shouldPulse) this.pulse(rowByNr);
    }
    if (this.shouldPulse && this.rowDetailElement) {
      this.pulse(this.rowDetailElement.find(r => r.nativeElement.getAttribute("nr") === nr));
    }
  }

  private pulse(el: ElementRef) {
    el.nativeElement.animate([
      {opacity: 1},
      {opacity: 0.3},        
      {opacity: 1}
    ], {
      duration: 2000,     
      delay: 500
    });
  }

  private scrollTo(row: ElementRef) {
    if (row != null) {
      row.nativeElement.scrollIntoView({behavior: "smooth", inline: "center", block: "center"});      
    }
  }

  private initMenu() {
    this.menuItems = [
      {
        label: "Spieltag wechseln", id: MenuItemId.NeuerSpieltag,
        icon: "pi pi-fw pi-calendar-times", command: _ => this.spieltagAuswahl()
      },
      {
        label: "Charts", id: MenuItemId.Charts, icon: "pi pi-fw pi-chart-bar",
        items: [
          {
            label: "Aktueller Spieltag", id: MenuItemId.CurrentCharts,
            icon: "pi pi-fw pi-calendar", command: _ => this.toCurrentCharts()
          },
          {
            label: "All-Time", id: MenuItemId.GlobalCharts,
            icon: "pi pi-fw pi-globe", command: _ =>  this.toGlobalCharts()
          },
        ]
      },
      {
        label: "Settings", id: MenuItemId.Settings,
        icon: "pi pi-fw pi-cog", command: _ => this.openSettings()
      },
      {
        label: "Regelbuch", id: MenuItemId.Rules,
        icon: "pi pi-fw pi-paperclip", command: _ => {
          this.displayMenu = false;
          window.open("https://github.com/HorseBadorties/splitnass/wiki/Regeln", "Regeln");
        }
      },
    ];
  }

}

enum MenuItemId {
  Settings = "Settings",
  NeuerSpieltag = "NeuerSpieltag",
  Rules = "Rules",
  Charts = "Charts",
  CurrentCharts = "CurrentCharts",
  GlobalCharts = "GlobalCharts"
}

export class Column {
  constructor(public field: String, public header: String, public width: String, public isActive = true) {}
}
