import { Component, OnDestroy, OnInit } from "@angular/core";
import { ConfirmationService, MenuItem, MessageService, SelectItem } from "primeng/api";
import { Subscription } from "rxjs";
import { Ansage, Gespielt, Runde } from "src/model/runde";
import { Solo } from "src/model/solo";
import { Spieler } from "src/model/spieler";
import { Spieltag } from "src/model/spieltag";
import { SpieltagService } from "../../services/spieltag.service";
import { SettingsService } from "../../services/settings.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-runde",
  templateUrl: "./runde.component.html",
  styleUrls: ["./runde.component.css"],
  providers: [MessageService, ConfirmationService]
})
export class RundeComponent implements OnInit, OnDestroy {
  spieltagServiceSubscribtion: Subscription;
  spieltag: Spieltag;
  runde: Runde;
  displayMenu = false;
  menuItems: MenuItem[];
  displaySettingsDialog = false;
  displayGewinnerDialog = false;
  selectedGewinner: Spieler[] = [];
  displaySpieltagDialog = false;
  moeglicheSpieler: Spieler[] = [];
  selectedSpieler: Spieler[] = [];
  selectedRundenanzahl = 42;
  moeglicheReAnsagen: SelectItem[];
  moeglicheKontraAnsagen: SelectItem[];
  moeglicheErgebnisse: SelectItem[];
  moeglicheSoli: Solo[];


  constructor(
    public spieltagService: SpieltagService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public settingsService: SettingsService,
    private router: Router) {
      this.moeglicheErgebnisse = this.getMoeglicheErgebnisse();
      this.moeglicheReAnsagen = this.getMoeglicheAnsagen(true);
      this.moeglicheKontraAnsagen = this.getMoeglicheAnsagen(false);
      this.moeglicheSoli = this.getMoeglicheSoli();
     }

  toRundenliste() {
    setTimeout(() => this.router.navigate(["rundenliste"], {skipLocationChange: false}), 50);
  }

  newSpieltag() {
    this.displayMenu = false;
    this.selectedSpieler = [];
    this.moeglicheSpieler = Spieler.all.slice();
    this.selectedRundenanzahl = 42;
    this.displaySpieltagDialog = true;
  }

  startNewSpieltag() {
    this.spieltagService.startSpieltag(this.selectedRundenanzahl, this.selectedSpieler, this.selectedSpieler[0]);
    this.displaySpieltagDialog = false;
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
    this.selectedGewinner = this.runde.gewinner;
  }

  rundeAbrechnen() {
    if (this.runde.gespielt === Gespielt.GespaltenerArsch) {
      this.confirmGespaltenerArsch();
    } else {
      this.runde.berechneErgebnis();
      if (this.runde.ergebnis === 0) {
        this.messageService.add({severity: "info", summary: "Gespaltener Arsch!", detail: "Böcke! :-)"});
        this.rundeAbgerechnet();
      } else {
        this.displayGewinnerDialog = true;
      }
    }
  }

  getAnzahlGewinner() {
    return this.runde.solo === Solo.KEIN_SOLO ? 2 : this.runde.reGewinnt ? 1 : 3;
  }

  rundeAbgerechnet() {
    this.displayGewinnerDialog = false;
    this.runde.gewinner = this.selectedGewinner;
    if (this.runde.isAktuelleRunde()) {
      this.spieltag.startNaechsteRunde();
    }
    this.setAktuelleRunde(this.spieltag.aktuelleRunde);
    this.spieltagService.sendSpieltag(this.spieltag);
  }

  confirmGespaltenerArsch() {
    this.confirmationService.confirm({
      header: "Gespaltener Arsch?",
      message: "Really?",
      accept: () => {
        this.runde.berechneErgebnis();
        this.rundeAbgerechnet();
      }
    });
  }

  private getMoeglicheAnsagen(fuerRe: boolean): SelectItem[] {
    return [
      {label: `<keine ${fuerRe ? "Re" : "Kontra"} Ansagen>`, value: Ansage.KeineAnsage},
      {label: `${fuerRe ? "Re" : "Kontra"}`, value: Ansage.ReOderKontra},
      {label: "keine 9", value: Ansage.Keine9},
      {label: "keine 6", value: Ansage.Keine6},
      {label: "keine 3", value: Ansage.Keine3},
      {label: "schwarz", value: Ansage.Schwarz}
    ];
  }

  private getMoeglicheErgebnisse(): SelectItem[] {
    return [
      {label: "<kein Ergebnis>", value: undefined},
      {label: "Re gewinnt", value: Gespielt.Re},
      {label: "Re keine 9", value: Gespielt.ReKeine9},
      {label: "Re keine 6", value: Gespielt.ReKeine6},
      {label: "Re keine 3", value: Gespielt.ReKeine3},
      {label: "Re schwarz", value: Gespielt.ReSchwarz},
      {label: "Kontra gewinnt", value: Gespielt.Kontra},
      {label: "Kontra keine 9", value: Gespielt.KontraKeine9},
      {label: "Kontra keine 6", value: Gespielt.KontraKeine6},
      {label: "Kontra keine 3", value: Gespielt.KontraKeine3},
      {label: "Kontra schwarz", value: Gespielt.KontraSchwarz},
      {label: "Gespaltener Arsch", value: Gespielt.GespaltenerArsch}
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
    if (this.runde.gespielt) {
      this.runde.berechneErgebnis();    
      this.confirmationService.confirm({
        "message": this.runde.ergebnisEvents.map(e => e["event"]).join(", "),
        "rejectVisible": false});
    } else {
      this.confirmationService.confirm({
        "message": "Kein Ergebnis", "rejectVisible": false});
    }
  }

  private initMenu() {
    this.menuItems = [
      {
          label: "Runde", id: MenuItemId.Runde, icon: "pi pi-pw pi-file",
          items: [
            {label: "Berechnung prüfen", id: MenuItemId.BerechnungPruefen,
              icon: "pi pi-fw pi-check", command: _ => this.berechnungPruefen()},
            {label: "Ergebnis korrigieren", id: MenuItemId.ErgebnisKorrigieren,
              icon: "pi pi-fw pi-pencil", command: _ => this.showToDoMessage("Ergebnis korrigieren")},
            {label: "Anzahl Böcke korrigieren", id: MenuItemId.BoeckeKorrigieren,
              icon: "pi pi-fw pi-pencil", command: _ => this.showToDoMessage("Anzahl Böcke korrigieren")}
        ]
      },
      {
          label: "Spieltag", id: MenuItemId.Spieltag, icon: "pi pi-fw pi-calendar",
          items: [
              {label: "Neuer Spieltag", id: MenuItemId.NeuerSpieltag,
                icon: "pi pi-fw pi-calendar-plus", command: _ => this.newSpieltag()},
              {label: "Spieler steigt ein", id: MenuItemId.SpielerRein,
                icon: "pi pi-fw pi-user-plus", command: _ => this.showToDoMessage("Spieler steigt ein")},
              {label: "Spieler steigt aus", id: MenuItemId.SpielerRaus,
                icon: "pi pi-fw pi-user-minus", command: _ => this.showToDoMessage("Spieler steigt aus")},
              {label: "Setze Rundenanzahl", id: MenuItemId.Rundenzahl,
                icon: "pi pi-fw pi-sort", command: _ => this.showToDoMessage("Setze Rundenanzahl")}
          ]
      },
      {
          label: "Settings", id: MenuItemId.Settings, 
            icon: "pi pi-fw pi-cog",  command: _ => this.openSettings()
      },
      {
        label: "Statistik", id: MenuItemId.Statistik, 
          icon: "pi pi-fw pi-info",  command: _ => this.toCharts()
    },
    ];
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
    this.displaySettingsDialog = true;
  }

  toCharts() {
    this.displayMenu = false;
    this.router.navigate(["charts"], {skipLocationChange: false});
  }


  private showToDoMessage(message: string) {
    this.displayMenu = false;
    this.messageService.add({severity: "info", summary: "ToDo", detail: message});
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

  getPunktestand() {
    return this.spieltag.spieler
      .map(spieler => `${spieler.name}: ${this.spieltag.getPunktestand(this.runde, spieler)}`)
      .join(" | ");
  }

  private getGewinner() {
    return this.runde.gewinner
      .map(spieler => spieler.name).join(", ");
  }

}

enum MenuItemId {
  Runde = "Runde",
  BerechnungPruefen = "BerechnungPruefen",
  ErgebnisKorrigieren = "ErgebnisKorrigieren",
  BoeckeKorrigieren = "BoeckeKorrigieren",

  Spieltag = "Spieltag",
  NeuerSpieltag = "NeuerSpieltag",
  SpielerRein = "SpielerRein",
  SpielerRaus = "SpielerRaus",
  Rundenzahl = "Rundenzahl",

  Settings = "Settings",
  Statistik = "Statistik"
}

