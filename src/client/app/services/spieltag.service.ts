import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { first } from "rxjs/operators";
import { Spieltag } from "src/model/spieltag";
import { Spieler } from "src/model/spieler";
import { SocketService } from "./socket.service";
import { SettingsService } from "./settings.service";

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
    this.settingsService.offlineStatus.subscribe(offline => this.offlineStatusChanded(offline));
    if (this.settingsService.offline) {
      this.offlineStatusChanded(this.settingsService.offline);
    }
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

  public startSpieltag(anzahlRunden: number, spieler: Array<Spieler>, geber: Spieler) {
    const result = new Spieltag();
    result.start(anzahlRunden, spieler, geber);
    this.sendSpieltag(result);
  }

  public sendSpieltag(spieltag: Spieltag): void {
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
