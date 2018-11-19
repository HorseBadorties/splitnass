import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { first } from "rxjs/operators";
import { Spieltag } from "src/model/spieltag";
import { Spieler } from "src/model/spieler";
import { SocketService } from "./socket.service";
import { SettingsService } from "./settings.service";
import { Runde } from "src/model/runde";

@Injectable({
  providedIn: "root"
})
export class SpieltagService {

  public spieltag = new BehaviorSubject(undefined);
  private aktuellerSpieltag: Spieltag;

  constructor(private socketService: SocketService, private settingsService: SettingsService) {
    this.socketService.spieltag.subscribe(spieltag => {
      if (!this.settingsService.offline) {
        this.setAktuellerSpieltag(spieltag);
      }
    });
    this.settingsService.hideInactivePlayersStatus.subscribe(_ => {
      if (this.aktuellerSpieltag) this.spieltag.next(this.aktuellerSpieltag);
    });
    this.settingsService.offlineStatus.subscribe(offline => this.offlineStatusChanded(offline));
    if (this.settingsService.offline) {
      this.offlineStatusChanded(this.settingsService.offline);
    }
    this.listSpieltage().then(list => console.log(list));
  }

  private offlineStatusChanded(offline: boolean) {
    if (offline) {
      this.settingsService.getSavedSpieltagJSON().pipe(first()).subscribe(spieltagJSON => {
        if (spieltagJSON) {
          this.setAktuellerSpieltag(Spieltag.fromJSON(spieltagJSON));
        }
      });
    } else {
      this.setAktuellerSpieltag(this.socketService.lastSpieltag);
    }
  }

  public startSpieltag(name: string, anzahlRunden: number, spieler: Array<Spieler>, geber: Spieler) {
    this.sendSpieltag(new Spieltag(name).start(anzahlRunden, spieler, geber));
  }

  public rundeAbgerechnet(runde: Runde) {
    if (runde.isAktuelleRunde()) {
      this.aktuellerSpieltag.startNaechsteRunde();
    }    
    this.sendSpieltag(this.aktuellerSpieltag);
  }

  public spielerSteigtEin(spieler: Spieler) {
    this.sendSpieltag(this.aktuellerSpieltag.spielerSteigtEin(spieler));
  }

  public spielerSteigtAus(spieler: Spieler) {
    this.sendSpieltag(this.aktuellerSpieltag.spielerSteigtAus(spieler));
  }

  public setztRundenanzahl(anzahl: number) {
    this.sendSpieltag(this.aktuellerSpieltag.setzeRundenanzahl(anzahl));
  }

  public undoLetzteRunde() {
    this.sendSpieltag(this.aktuellerSpieltag.undoLetzteRunde());
  }

  public listSpieltage() {
    return this.socketService.listSpieltage();
  }
  

  private sendSpieltag(spieltag: Spieltag) {
    if (this.settingsService.offline) {
      this.setAktuellerSpieltag(spieltag);
      this.settingsService.saveSpieltagJSON(Spieltag.toJSON(spieltag));
    } else {
      this.socketService.sendSpieltag(spieltag);
    }
  }

  private setAktuellerSpieltag(spieltag: Spieltag) {
    if (spieltag) {
      this.aktuellerSpieltag = spieltag;
      this.spieltag.next(this.aktuellerSpieltag);
    }
  }

}
