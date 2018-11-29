import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { first } from "rxjs/operators";
import { Message } from "primeng/api";
import { Spieltag } from "src/model/spieltag";
import { Spieler } from "src/model/spieler";
import { SocketService } from "./socket.service";
import { SettingsService } from "./settings.service";
import { Runde } from "src/model/runde";

@Injectable({
  providedIn: "root"
})
export class SpieltagService {

  public spieltag = new BehaviorSubject<Spieltag>(undefined);
  public messages = new Subject<Message>();
  public online = new Subject<boolean>();
  private aktuellerSpieltag: Spieltag;
  private socketIsOnline = false;  

  constructor(private socketService: SocketService, private settingsService: SettingsService) {
    this.socketService.spieltag.subscribe(spieltag => {
      if (!this.settingsService.offline) {
        this.setSpieltag(spieltag);
      }
    });
    this.socketService.messages.subscribe(message => this.messages.next(message));
    this.settingsService.hideInactivePlayersStatus.subscribe(_ => {
      if (this.aktuellerSpieltag) this.setSpieltag(this.aktuellerSpieltag);
    });
    this.settingsService.offlineStatus.subscribe(_ => this.onOnlineStatusChanged());
    this.socketService.connected.subscribe(connected => {
      this.socketIsOnline = connected;
      this.onOnlineStatusChanged();
    });
  }
 
  public startSpieltag(name: string, anzahlRunden: number, spieler: Array<Spieler>, geber: Spieler) {
    this.sendSpieltagUpdate(new Spieltag(name).start(anzahlRunden, spieler, geber));
  }

  public rundeAbgerechnet(runde: Runde) {
    if (runde.isAktuelleRunde()) {
      this.aktuellerSpieltag.startNaechsteRunde();
    }    
    this.sendSpieltagUpdate(this.aktuellerSpieltag);
  }

  public spielerSteigtEin(spieler: Spieler) {
    this.sendSpieltagUpdate(this.aktuellerSpieltag.spielerSteigtEin(spieler));
  }

  public spielerSteigtAus(spieler: Spieler) {
    this.sendSpieltagUpdate(this.aktuellerSpieltag.spielerSteigtAus(spieler));
  }

  public setztRundenanzahl(anzahl: number) {
    this.sendSpieltagUpdate(this.aktuellerSpieltag.setzeRundenanzahl(anzahl));
  }

  public undoLetzteRunde() {
    this.sendSpieltagUpdate(this.aktuellerSpieltag.undoLetzteRunde());
  }

  public listSpieltage(): Observable<Array<Object>> {
    return Observable.create(subscriber => {
      this.socketService.listSpieltage();
      this.socketService.spieltagList.pipe(first()).subscribe(list => {
        console.log("returning list of Spieltage");
        subscriber.next(list);
      })
    });
  }
  
  public setAktuellerSpieltag(beginn: string) {
    this.socketService.joinSpieltag(beginn);
    this.socketService.joinedSpieltag.pipe(first()).subscribe(spieltagJSON => {
      if (spieltagJSON) {
        const spieltag = Spieltag.fromJSON(spieltagJSON);
        this.setSpieltag(spieltag);
        this.settingsService.joinedSpieltag(spieltag.beginn.toJSON());
        console.log(`aktueller Spieltag: ${beginn}`);
      } else {
        this.setSpieltag(null);
      }
    })
  }

  public sendMessage(message: Message) {
    if (this.weAreOnline()) {
      this.socketService.sendMessage(message);
    }
  }
  
  private sendSpieltagUpdate(spieltag: Spieltag) {
    if (this.weAreOnline()) {
      this.setSpieltag(spieltag);
      this.settingsService.saveSpieltagJSON(Spieltag.toJSON(spieltag));
    } else {
      this.socketService.sendSpieltag(spieltag);
    }
  }

  private setSpieltag(spieltag: Spieltag) {
    this.aktuellerSpieltag = spieltag;
    this.spieltag.next(this.aktuellerSpieltag); 
  }
  
  private weAreOnline() {
    return !this.settingsService.offline && this.socketIsOnline;
  }

  private onOnlineStatusChanged() {
    this.online.next(this.weAreOnline());
    if (this.weAreOnline()) {      
      console.log(`*** we are online ***`);
      console.log(`loading last Spieltag`);
      this.settingsService.getJoinedSpieltag().pipe(first()).subscribe(beginn => {
        if (beginn) {
          this.setAktuellerSpieltag(beginn);            
        }
      });
    } else {
      console.log(`*** we are offline ***`);
    }
  }

}
