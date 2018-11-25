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
  private aktuellerSpieltag: Spieltag;

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
    this.settingsService.offlineStatus.subscribe(offline => this.offlineStatusChanded(offline));
    if (this.settingsService.offline) {
      this.offlineStatusChanded(this.settingsService.offline);
    }       
    this.socketService.connected.pipe(first()).subscribe(connected => {
      if (connected) {
        this.settingsService.getJoinedSpieltag().pipe(first()).subscribe(beginn => {
          if (beginn) {
            console.log(`loading last Spieltag ${beginn}`);
            this.setAktuellerSpieltag(beginn);            
          } else {
            this.setSpieltag(null);
          }
        });
      }
    });
  }

  private offlineStatusChanded(offline: boolean) {
    if (offline) {
      this.settingsService.getSavedSpieltagJSON().pipe(first()).subscribe(spieltagJSON => {
        if (spieltagJSON) {
          this.setSpieltag(Spieltag.fromJSON(spieltagJSON));
        }
      });
    } else {
      this.socketService.spieltag.pipe(first()).subscribe(spieltag => this.setSpieltag(spieltag));
    }
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
    this.socketService.sendMessage(message);
  }
  
  private sendSpieltagUpdate(spieltag: Spieltag) {
    if (this.settingsService.offline) {
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
  
}
