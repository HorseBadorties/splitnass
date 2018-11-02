import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Spieltag } from "../../../model/spieltag";
import { Spieler } from "../../../model/spieler";
import { Runde } from "../../../model/runde";
import { SocketService } from "./socket.service";

@Injectable({
  providedIn: "root"
})
export class SpieltagService {

  aktuellerSpieltag: Spieltag;
  selectedRunde: Runde;

  constructor(private socketService: SocketService) {
    if (socketService.lastSpieltag) {
      this.aktuellerSpieltag = socketService.lastSpieltag;
    } else {
      const spieler = [
        new Spieler(1, "Claus"),
        new Spieler(2, "Guido"),
        new Spieler(3, "Levent"),
        // new Spieler(4, "Ralf"),
        new Spieler(5, "Torsten"),
        new Spieler(9, "Thomas")];
      this.aktuellerSpieltag = this.startSpieltag(80, spieler, spieler[0]);
    }
  }

  public getAktuellerSpieltag(): Observable<Spieltag> {
    return of(this.aktuellerSpieltag);
  }

  public startSpieltag(anzahlRunden: number, spieler: Array<Spieler>, geber: Spieler): Spieltag {
    const result = new Spieltag();
    result.start(anzahlRunden, spieler, geber);
    this.aktuellerSpieltag = result;
    return result;
  }
}
