import { Component, OnInit, OnDestroy } from "@angular/core";
import { SpieltagService } from "../services/spieltag.service";
import { MessageService, ConfirmationService, SelectItem, MenuItem } from "primeng/api";
import { Runde, Gespielt, Ansage } from "../../../model/runde";
import { Spieltag } from "../../../model/spieltag";
import { Solo } from "../../../model/solo";
import { Spieler } from "../../../model/spieler";
import { SocketService } from "../services/socket.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-runde",
  templateUrl: "./runde.component.html",
  styleUrls: ["./runde.component.css"],
  providers: [MessageService, ConfirmationService]
})
export class RundeComponent implements OnInit, OnDestroy {
  spieltagServiceSubscribtion: Subscription;
  socketServiceSubscribtion: Subscription;
  spieltag: Spieltag;
  aktuelleRunde: Runde;
  displayMenu = false;
  menuItems: MenuItem[];
  displayGewinnerDialog = false;
  selectedGewinner: Spieler[] = [];
  displaySpieltagDialog = false;
  moeglicheSpieler: Spieler[] = [];
  selectedSpieler: Spieler[] = [];
  selectedRundenanzahl: 42;
  moeglicheReAnsagen: SelectItem[];
  moeglicheKontraAnsagen: SelectItem[];
  moeglicheErgebnisse: SelectItem[];
  moeglicheSoli: Solo[];


  constructor(
    public spieltagService: SpieltagService,
    public socketService: SocketService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService) {
      this.moeglicheErgebnisse = this.getMoeglicheErgebnisse();
      this.moeglicheReAnsagen = this.getMoeglicheAnsagen(true);
      this.moeglicheKontraAnsagen = this.getMoeglicheAnsagen(false);
      this.moeglicheSoli = this.getMoeglicheSoli();
     }

  newSpieltag() {
    this.displayMenu = false;
    this.selectedSpieler = [];
    this.moeglicheSpieler = Spieler.all.slice();
    this.selectedRundenanzahl = 42;
    this.displaySpieltagDialog = true;
  }

  startNewSpieltag() {
    this.spieltag = this.spieltagService.startSpieltag(this.selectedRundenanzahl, this.selectedSpieler, this.selectedSpieler[0]);
    this.aktuelleRunde = this.spieltag.aktuelleRunde;
    this.socketService.sendSpieltag(this.spieltag);
    this.displaySpieltagDialog = false;
  }

  vonVorneHereinChanged(re: boolean) {
    if (re && this.aktuelleRunde.reVonVorneHerein && this.aktuelleRunde.reAngesagt === Ansage.KeineAnsage) {
      this.aktuelleRunde.reAngesagt = Ansage.ReOderKontra;
    }
    if (!re && this.aktuelleRunde.kontraVonVorneHerein && this.aktuelleRunde.kontraAngesagt === Ansage.KeineAnsage) {
      this.aktuelleRunde.kontraAngesagt = Ansage.ReOderKontra;
    }
  }

  angesagtChanged(re: boolean) {
    if (re && this.aktuelleRunde.reVonVorneHerein && this.aktuelleRunde.reAngesagt === Ansage.KeineAnsage) {
      this.aktuelleRunde.reVonVorneHerein = false;
    }
    if (!re && this.aktuelleRunde.kontraVonVorneHerein && this.aktuelleRunde.kontraAngesagt === Ansage.KeineAnsage) {
      this.aktuelleRunde.kontraVonVorneHerein = false;
    }
  }

  isNochNichtGespielteRunde() {
    return !this.aktuelleRunde.isGespielteRunde() && !this.aktuelleRunde.isAktuelleRunde();
  }

  vorherigeRunde() {
    if (this.spieltag.getVorherigeRunde(this.aktuelleRunde)) {
      this.setAktuelleRunde(this.spieltag.getVorherigeRunde(this.aktuelleRunde));
    }
  }

  naechsteRunde() {
    if (this.spieltag.getNaechsteRunde(this.aktuelleRunde)) {
      this.setAktuelleRunde(this.spieltag.getNaechsteRunde(this.aktuelleRunde));
    }
  }

  private setAktuelleRunde(r: Runde) {
    this.aktuelleRunde = r;
    this.selectedGewinner = this.aktuelleRunde.gewinner;
  }

  rundeAbrechnen() {
    if (this.aktuelleRunde.gespielt === Gespielt.GespaltenerArsch) {
      this.confirmGespaltenerArsch();
    } else {
      this.aktuelleRunde.berechneErgebnis();
      if (this.aktuelleRunde.ergebnis === 0) {
        this.messageService.add({severity: "info", summary: "Gespaltener Arsch!", detail: "Böcke! :-)"});
        this.rundeAbgerechnet();
      } else {
        this.displayGewinnerDialog = true;
      }
    }
  }

  getAnzahlGewinner() {
    return this.aktuelleRunde.solo === Solo.KEIN_SOLO ? 2 : this.aktuelleRunde.reGewinnt ? 1 : 3;
  }

  rundeAbgerechnet() {
    this.displayGewinnerDialog = false;
    this.aktuelleRunde.gewinner = this.selectedGewinner;
    this.spieltag.startNaechsteRunde();
    this.setAktuelleRunde(this.spieltag.aktuelleRunde);
    this.socketService.sendSpieltag(this.spieltag);
  }

  confirmGespaltenerArsch() {
    this.confirmationService.confirm({
      header: "Gespaltener Arsch?",
      message: "Really?",
      accept: () => {
        this.aktuelleRunde.berechneErgebnis();
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
    this.spieltagServiceSubscribtion = this.spieltagService.getAktuellerSpieltag().subscribe(spieltag => {
      this.spieltag = spieltag;
      if (this.spieltagService.selectedRunde) {
        this.setAktuelleRunde(this.spieltagService.selectedRunde);
      } else {
        this.setAktuelleRunde(spieltag.aktuelleRunde);
      }
    });
  }

  ngOnDestroy() {
    if (this.spieltagServiceSubscribtion) {
      this.spieltagServiceSubscribtion.unsubscribe();
    }
    if (this.socketServiceSubscribtion) {
      this.socketServiceSubscribtion.unsubscribe();
    }
  }

  private initMenu() {
    this.menuItems = [
      {
          label: "Runde", id: MenuItemId.Runde, icon: "pi pi-pw pi-file",
          items: [
            {label: "Berechnung prüfen", id: MenuItemId.BerechnungPruefen,
              icon: "pi pi-fw pi-check", command: _ => this.showToDoMessage("Berechnung prüfen")},
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
          label: "Settings", id: MenuItemId.Settings, icon: "pi pi-fw pi-cog",
      }];
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


  private showToDoMessage(message: string) {
    this.displayMenu = false;
    this.messageService.add({severity: "info", summary: "ToDo", detail: message});
  }

  getStatusDerRunde() {
    if (this.aktuelleRunde.isAktuelleRunde()) {
      return "laufende Runde";
    } else if (this.aktuelleRunde.isGespielteRunde()) {
      return "gespielte Runde";
    } else {
      return "zu spielende Runde";
    }
  }

  getRundenInfo() {
    const result = [];
    if (this.aktuelleRunde.isAktuelleRunde()) {
      result.push(`Geber: ${this.aktuelleRunde.geber.name}`);
      result.push(`Aufspielt: ${this.aktuelleRunde.aufspieler.name}`);
      result.push(`Böcke: ${this.aktuelleRunde.boecke}`);
      if (this.getErgebnisVorherigeRunde()) {
        result.push(`Vorherige Runde: ${this.getErgebnisVorherigeRunde()}`);
      }
    } else if (this.aktuelleRunde.isGespielteRunde()) {
      result.push(`Geber: ${this.aktuelleRunde.geber.name}`);
      result.push(`Böcke: ${this.aktuelleRunde.boecke}`);
      result.push(`Ergebnis: ${this.aktuelleRunde.ergebnis}`);
      result.push(`Gewinner: ${this.getGewinner()}`);
    } else {
      result.push(`Böcke: ${this.aktuelleRunde.boecke}`);
    }
    return result;
  }

  private getErgebnisVorherigeRunde() {
    const vorherigeRunde = this.spieltag.getVorherigeRunde(this.aktuelleRunde);
    if (vorherigeRunde) {
      return vorherigeRunde.ergebnis;
    } else {
      return undefined;
    }
  }

  getPunktestand() {
    return this.spieltag.spieler
      .map(spieler => `${spieler.name} = ${this.spieltag.getPunktestand(this.aktuelleRunde, spieler)}`)
      .join(", ");
  }

  private getGewinner() {
    return this.aktuelleRunde.gewinner
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

  Settings = "Settings"
}

