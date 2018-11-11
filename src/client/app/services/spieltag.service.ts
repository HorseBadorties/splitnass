import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Spieltag } from "src/model/spieltag";
import { Spieler } from "src/model/spieler";
import { SocketService } from "./socket.service";

@Injectable({
  providedIn: "root"
})
export class SpieltagService {

  public spieltag = new BehaviorSubject(undefined);
  private aktuellerSpieltag: Spieltag;

  constructor(private socketService: SocketService) {
    this.socketService.spieltag.subscribe(spieltag => {
      this.aktuellerSpieltag = spieltag;
      this.spieltag.next(this.aktuellerSpieltag);
    });
  }

  public startSpieltag(anzahlRunden: number, spieler: Array<Spieler>, geber: Spieler) {
    const result = new Spieltag();
    result.start(anzahlRunden, spieler, geber);
    this.socketService.sendSpieltag(result);
  }

  public sendSpieltag(spieltag: Spieltag): void {
    this.socketService.sendSpieltag(spieltag);
  }

}
