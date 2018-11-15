import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as _ from "lodash";
import { MenuItem, MessageService, SelectItem } from "primeng/api";
import { Subscription } from "rxjs";
import { Ansage, Gespielt, Runde } from "src/model/runde";
import { Solo } from "src/model/solo";
import { Spieler } from "src/model/spieler";
import { Spieltag } from "src/model/spieltag";
import { DialogService } from "../../dialogs/dialog.service";
import { SettingsService } from "../../services/settings.service";
import { SpieltagService } from "../../services/spieltag.service";
import { NumberpickerComponent } from "../../dialogs/numberpicker/numberpicker.component";
import { SettingsComponent } from "../../dialogs/settings/settings.component";
import { SpielerauswahlComponent } from "../../dialogs/spielerauswahl/spielerauswahl.component";
import { NeuerSpieltagComponent } from "../../dialogs/neuer-spieltag/neuer-spieltag.component";
import { GewinnerauswahlComponent } from "../../dialogs/gewinnerauswahl/gewinnerauswahl.component";
import { GenericDialogComponent, Type } from "../../dialogs/generic-dialog/generic-dialog.component";


@Component({
  selector: "app-runde",
  templateUrl: "./runde.component.html",
  styleUrls: ["./runde.component.css"],
  providers: [MessageService]
})
export class RundeComponent implements OnInit, OnDestroy {
  spieltagServiceSubscribtion: Subscription;
  spieltag: Spieltag;
  runde: Runde;
  displayMenu = false;
  menuItems: MenuItem[];
  moeglicheReAnsagen: SelectItem[];
  moeglicheKontraAnsagen: SelectItem[];
  moeglicheErgebnisse: SelectItem[];
  moeglicheSoli: Solo[];
 
  constructor(
    public spieltagService: SpieltagService,
    private messageService: MessageService,
    public settingsService: SettingsService,
    private dialogService: DialogService,
    private router: Router) {
    this.moeglicheErgebnisse = this.getMoeglicheErgebnisse();
    this.moeglicheReAnsagen = this.getMoeglicheAnsagen(true);
    this.moeglicheKontraAnsagen = this.getMoeglicheAnsagen(false);
    this.moeglicheSoli = this.getMoeglicheSoli();
  }

  toRundenliste() {
    setTimeout(() => this.router.navigate(["rundenliste"], { skipLocationChange: false }), 50);
  }

  onSwipeLeft(evt) {
    this.toRundenliste();
  }

  onSwipeRight(evt) {
    this.toRundenliste();
  }

  spielerSteigtAus() {
    this.displayMenu = false;
    const data: any = {spieler: this.spieltag.spieler.filter(s => s.isAktiv), message: "Wer steigt aus?"};
    this.dialogService.open(SpielerauswahlComponent, data).afterClosed.subscribe(result => {
      if (result) {
        const inaktiverSpieler = result as Spieler;
        this.spieltagService.spielerSteigtAus(inaktiverSpieler);
        this.messageService.add({ severity: "success", summary: "", detail: `${inaktiverSpieler.name} ist ausgestiegen!` }); 
      }
    });
  }

  spielerSteigtEin() {
    this.displayMenu = false;
    const moeglicheSpieler = _.difference(Spieler.all.slice(), this.spieltag.spieler.filter(s => s.isAktiv));
    const data: any = {spieler: moeglicheSpieler, message: "Wer steigt ein?"};
    this.dialogService.open(SpielerauswahlComponent, data).afterClosed.subscribe(result => {
      if (result) {
        const neuerSpieler = result as Spieler;
        this.spieltagService.spielerSteigtEin(neuerSpieler);    
        const punkteNeuerSpieler = this.spieltag.getPunktestand(this.runde, neuerSpieler);    
        this.messageService.add({ severity: "success", summary: "", 
          detail: `${neuerSpieler.name} ist mit ${punkteNeuerSpieler} ${punkteNeuerSpieler === 1 ? "Punkt" : "Punkte"} eingestiegen!` }); 
      }
    });
  }

  setzeRundenanzahl() {
    this.displayMenu = false;
    const data: any = {
      min: this.spieltag.aktuelleRunde.nr, 
      value: this.spieltag.runden.length, 
      message: "Wieviele Runden sollen gespielt werden?"
    };
    this.dialogService.open(NumberpickerComponent, data).afterClosed.subscribe(result => {
      if (result) {
        this.spieltagService.setztRundenanzahl(result);
        this.messageService.add({ severity: "success", summary: "", 
          detail: `Spieltag hat jetzt ${result} Runden!`}); 
      }
    });
  }

  zeigeSitzreihenfolge() {
    this.displayMenu = false; 
    const data: any = {header: "Sitzreihenfolge", message: this.spieltag.getAktuelleSitzreihenfolgeAsHTMLString()};
    this.dialogService.open(GenericDialogComponent, data);
  }

  newSpieltag() {
    this.displayMenu = false;
    this.dialogService.open(NeuerSpieltagComponent, {});    
  }

  

  vonVorneHereinChanged(re: boolean) {
    if (re && this.runde.reVonVorneHerein && this.runde.reAngesagt === Ansage.KeineAnsage) {
      this.runde.reAngesagt = Ansage.ReOderKontra;
    }
    if (!re && this.runde.kontraVonVorneHerein && this.runde.kontraAngesagt === Ansage.KeineAnsage) {
      this.runde.kontraAngesagt = Ansage.ReOderKontra;
    }
  }

  angesagtChanged(re: boolean) {
    if (re && this.runde.reVonVorneHerein && this.runde.reAngesagt === Ansage.KeineAnsage) {
      this.runde.reVonVorneHerein = false;
    }
    if (!re && this.runde.kontraVonVorneHerein && this.runde.kontraAngesagt === Ansage.KeineAnsage) {
      this.runde.kontraVonVorneHerein = false;
    }
  }

  isNochNichtGespielteRunde() {
    return !this.runde.isGespielteRunde() && !this.runde.isAktuelleRunde();
  }

  vorherigeRunde() {
    if (this.spieltag.getVorherigeRunde(this.runde)) {
      this.setAktuelleRunde(this.spieltag.getVorherigeRunde(this.runde));
    }
  }

  naechsteRunde() {
    if (this.spieltag.getNaechsteRunde(this.runde)) {
      this.setAktuelleRunde(this.spieltag.getNaechsteRunde(this.runde));
    }
  }

  private setAktuelleRunde(r: Runde) {
    this.runde = r;    
    this.menuItemById(MenuItemId.UndoLetzteRunde).disabled = this.spieltag.aktuelleRunde.nr === 1;
    this.menuItemById(MenuItemId.SpielerRein).disabled = this.spieltag.getAktiveSpieler().length >= 6;
    this.menuItemById(MenuItemId.SpielerRaus).disabled = this.spieltag.getAktiveSpieler().length === 4;
    this.menuItemById(MenuItemId.ErgebnisKorrigieren).disabled = !r.isBeendet;
    this.menuItemById(MenuItemId.BoeckeKorrigieren).disabled = r.isBeendet;
  }

  rundeAbrechnen() {
    if (this.runde.gespielt === Gespielt.GespaltenerArsch) {
      this.confirmGespaltenerArsch();
    } else {
      this.runde.berechneErgebnis();
      if (this.runde.ergebnis === 0) {
        this.messageService.add({ severity: "info", summary: "Gespaltener Arsch!", detail: "Böcke! :-)" });
        this.spieltagService.rundeAbgerechnet(this.runde);
      } else {
        this.openGewinnerDialog();      
      }
    }
  }

  openGewinnerDialog() {
    const data: any = {
      spieler: this.runde.spieler,
      gewinner: this.runde.gewinner,
      ergebnis: this.runde.ergebnis,
      anzahlGewinner: this.runde.solo === Solo.KEIN_SOLO ? 2 : this.runde.reGewinnt ? 1 : 3
    };
    this.dialogService.open(GewinnerauswahlComponent, data).afterClosed.subscribe(result => { 
      if (result) {
        this.runde.gewinner = result as Array<Spieler>;
        this.spieltagService.rundeAbgerechnet(this.runde);
      }
    });
  }

  confirmGespaltenerArsch() {
    this.doIfConfirmed("Gespaltener Arsch", "Wirklich?", () => {
      this.runde.berechneErgebnis();
      this.spieltagService.rundeAbgerechnet(this.runde);
    });    
  }

  private doIfConfirmed(header: string, message: string, action: () => void) {
    const data: any = {
      header: header,
      message: message,
      type: Type.CONFIRMATION      
    };
    this.dialogService.open(GenericDialogComponent, data).afterClosed.subscribe(result => { 
      if (result === "Yes") {
        action();
      }
    });
  }

  private getMoeglicheAnsagen(fuerRe: boolean): SelectItem[] {
    return [
      { label: `<keine ${fuerRe ? "Re" : "Kontra"} Ansagen>`, value: Ansage.KeineAnsage },
      { label: `${fuerRe ? "Re" : "Kontra"}`, value: Ansage.ReOderKontra },
      { label: "keine 9", value: Ansage.Keine9 },
      { label: "keine 6", value: Ansage.Keine6 },
      { label: "keine 3", value: Ansage.Keine3 },
      { label: "schwarz", value: Ansage.Schwarz }
    ];
  }

  private getMoeglicheErgebnisse(): SelectItem[] {
    return [
      { label: "<kein Ergebnis>", value: undefined },
      { label: "Re gewinnt", value: Gespielt.Re },
      { label: "Re keine 9", value: Gespielt.ReKeine9 },
      { label: "Re keine 6", value: Gespielt.ReKeine6 },
      { label: "Re keine 3", value: Gespielt.ReKeine3 },
      { label: "Re schwarz", value: Gespielt.ReSchwarz },
      { label: "Kontra gewinnt", value: Gespielt.Kontra },
      { label: "Kontra keine 9", value: Gespielt.KontraKeine9 },
      { label: "Kontra keine 6", value: Gespielt.KontraKeine6 },
      { label: "Kontra keine 3", value: Gespielt.KontraKeine3 },
      { label: "Kontra schwarz", value: Gespielt.KontraSchwarz },
      { label: "Gespaltener Arsch", value: Gespielt.GespaltenerArsch }
    ];
  }

  private getMoeglicheSoli() {
    return [
      Solo.KEIN_SOLO,
      Solo.FLEISCHLOS,
      Solo.DAMENSOLO,
      Solo.BAUERNSOLO,
      Solo.TRUMPFSOLO,
      Solo.NULL,
      Solo.STILLES_SOLO
    ];
  }

  ngOnInit() {
    this.initMenu();
    this.spieltagServiceSubscribtion = this.spieltagService.spieltag.subscribe(spieltag => {
      if (spieltag) {
        this.spieltag = spieltag;
        this.setAktuelleRunde(spieltag.aktuelleRunde);
      }
    });
  }

  ngOnDestroy() {
    if (this.spieltagServiceSubscribtion) {
      this.spieltagServiceSubscribtion.unsubscribe();
    }
  }

  private berechnungPruefen() {
    this.displayMenu = false;   
    const data: any = {
      header: "Berechnetes Ergebnis", 
      message: "Kein Ergebnis"
    };
    if (this.runde.gespielt) {
      this.runde.berechneErgebnis();
      data.message = this.runde.ergebnisEvents.map(e => e["event"]).join("<br>");
    }
    this.dialogService.open(GenericDialogComponent, data);
  }

  private initMenu() {
    this.menuItems = [      
      {
        label: "Spieltag", id: MenuItemId.Spieltag, icon: "pi pi-fw pi-calendar",
        items: [
          {
            label: "Undo letzte Runde", id: MenuItemId.UndoLetzteRunde,
            icon: "pi pi-fw pi-trash", command: _ => this.undoLetzteRunde()
          },          
          {
            label: "Spieler steigt ein", id: MenuItemId.SpielerRein,
            icon: "pi pi-fw pi-user-plus", command: _ => this.spielerSteigtEin()
          },
          {
            label: "Spieler steigt aus", id: MenuItemId.SpielerRaus,
            icon: "pi pi-fw pi-user-minus", command: _ => this.spielerSteigtAus()
          },
          {
            label: "Setze Rundenanzahl", id: MenuItemId.Rundenzahl,
            icon: "pi pi-fw pi-sort", command: _ => this.setzeRundenanzahl()
          },
          {
            label: "Aktuelle Sitzreihenfolge", id: MenuItemId.Sitzreihenfolge,
            icon: "pi pi-fw pi-users", command: _ => this.zeigeSitzreihenfolge()
          },
          {
            label: "Neuer Spieltag", id: MenuItemId.NeuerSpieltag,
            icon: "pi pi-fw pi-calendar-plus", command: _ => this.newSpieltag()
          }
        ]
      },
      {
        label: "Runde", id: MenuItemId.Runde, icon: "pi pi-pw pi-file",
        items: [         
          {
            label: "Berechnung prüfen", id: MenuItemId.BerechnungPruefen,
            icon: "pi pi-fw pi-check", command: _ => this.berechnungPruefen()
          },
          {
            label: "Ergebnis korrigieren", id: MenuItemId.ErgebnisKorrigieren,
            icon: "pi pi-fw pi-pencil", command: _ => this.showToDoMessage("Ergebnis korrigieren")
          },
          {
            label: "Anzahl Böcke korrigieren", id: MenuItemId.BoeckeKorrigieren,
            icon: "pi pi-fw pi-pencil", command: _ => this.showToDoMessage("Anzahl Böcke korrigieren")
          },
        ]
      },
      {
        label: "Charts", id: MenuItemId.Charts,
        icon: "pi pi-fw pi-chart-bar", command: _ => this.toCharts()
      },
      {
        label: "Settings", id: MenuItemId.Settings,
        icon: "pi pi-fw pi-cog", command: _ => this.openSettings()
      },
    ];
  }

  private undoLetzteRunde() {
    this.displayMenu = false;   
    this.doIfConfirmed("Letzte Runde rückgängig machen?", "Wirklich?", () => {
      this.spieltagService.undoLetzteRunde();
    this.messageService.add({ severity: "info", summary: "Undo erfolgt", detail: "Die letzte Runde wurde rückgängig gemacht!" });
    });   
    
  }

  private menuItemById(id: MenuItemId): MenuItem {
    function flatten(items, result) {
      return items.reduce((acc, val) => {
        acc.push(val);
        if (val.items) acc.concat(flatten(val.items, acc));
        return acc;
      }, result);
    }
    return flatten(this.menuItems, []).find(item => item.id === id);
  }

  openSettings() {
    this.displayMenu = false;
    this.dialogService.open(SettingsComponent, {});
  }

  toCharts() {
    this.displayMenu = false;
    this.router.navigate(["charts"], { skipLocationChange: false });
  }


  private showToDoMessage(message: string) {
    this.displayMenu = false;
    this.messageService.add({ severity: "info", summary: "ToDo", detail: message });
  }

  getStatusDerRunde() {
    if (this.runde.isAktuelleRunde()) {
      return "laufende Runde";
    } else if (this.runde.isGespielteRunde()) {
      return "gespielte Runde";
    } else {
      return "zu spielende Runde";
    }
  }

  getRundenInfo() {
    const result = [];
    if (this.runde.isAktuelleRunde()) {
      result.push(`Geber: ${this.runde.geber.name}`);
      result.push(`Aufspiel: ${this.runde.aufspieler.name}`);
      result.push(`Böcke: ${this.runde.boecke}`);
      if (this.getErgebnisVorherigeRunde()) {
        result.push(`Vorherige Runde: ${this.getErgebnisVorherigeRunde()}`);
      }
    } else if (this.runde.isDummyRunde()) {
      if (this.runde.ergebnisEvents) {
       result.push(_.first(this.runde.ergebnisEvents)["event"]);
      }
    } else if (this.runde.isGespielteRunde()) {
      result.push(`Geber: ${this.runde.geber.name}`);
      result.push(`Böcke: ${this.runde.boecke}`);
      result.push(`Ergebnis: ${this.runde.ergebnis}`);
      result.push(`Gewinner: ${this.getGewinner()}`);
    } else {
      result.push(`Böcke: ${this.runde.boecke}`);
    }
    return result;
  }

  private getErgebnisVorherigeRunde() {
    const vorherigeRunde = this.spieltag.getVorherigeRunde(this.runde);
    if (vorherigeRunde) {
      return vorherigeRunde.ergebnis;
    } else {
      return undefined;
    }
  }

  getPunktestaende() {
    const result = [];
    this.spieltag.spieler
      .filter(s => this.settingsService.hideInactivePlayers ? s.isAktiv : true)
      .forEach(s => result.push({
      name: s.name, 
      punkte: this.spieltag.getPunktestand(this.runde, s),
      aktiv: s.isAktiv
    }));
    return result;
  }

  private getGewinner() {
    return this.runde.gewinner
      .map(spieler => spieler.name).join(", ");
  }

}

enum MenuItemId {
  Runde = "Runde",
  UndoLetzteRunde = "UndoLetzteRunde",
  BerechnungPruefen = "BerechnungPruefen",
  ErgebnisKorrigieren = "ErgebnisKorrigieren",
  BoeckeKorrigieren = "BoeckeKorrigieren",

  Spieltag = "Spieltag",
  NeuerSpieltag = "NeuerSpieltag",
  SpielerRein = "SpielerRein",
  SpielerRaus = "SpielerRaus",
  Rundenzahl = "Rundenzahl",
  Sitzreihenfolge = "Sitzreihenfolge",

  Settings = "Settings",
  Charts = "Statistik"
}

