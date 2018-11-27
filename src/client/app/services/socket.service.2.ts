import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Message } from "primeng/api";

import { Spieltag } from "src/model/spieltag";

const LOCAL_SERVER_URL = `ws://localhost:${63085}`;
const REMOTE_SERVER_URL = `ws://schruv.deneb.uberspace.de:63085`;

@Injectable({
  providedIn: "root"
})
export class SocketService {
  private socket: WebSocket;
  public spieltag = new Subject<Spieltag>();
  private _joinedSpieltagBeginn: string;
  public joinedSpieltag = new Subject<string>();
  public spieltagList = new Subject<Array<Spieltag>>();
  public connected = new Subject<boolean>();
  public messages = new Subject<Message>();

  private pingTimer: NodeJS.Timer;

  constructor() {
    this.initSocket();
  }

  public sendSpieltag(spieltag: Spieltag): void {
    const data = Spieltag.toJSON(spieltag);
    console.log(`sending spieltag update`);
    // this.socket.compress(true).emit("spieltagUpdated", data, spieltag.beginn);
  }

  public listSpieltage() {
    // this.socket.on("listSpieltage", list => {
    //   this.socket.off("listSpieltage");
    //   this.spieltagList.next(list);
    // });
    // this.socket.emit("listSpieltage");
  }

  public joinSpieltag(beginn: string) {
    // this.socket.on("joinedSpieltag", s => {
    //   this.socket.off("joinedSpieltag");
    //   this._joinedSpieltagBeginn = beginn;
    //   this.joinedSpieltag.next(s);
    // });
    // this.socket.emit("joinSpieltag", beginn);
  }

  public sendMessage(message: Message) {
    // this.socket.emit("message", message);
  }

  private initSocket(): void {
      
    this.socket = new WebSocket(LOCAL_SERVER_URL);
    this.socket.onmessage = (event: MessageEvent) => {
      console.log(event.data);
    };
    this.socket.onerror = (event: Event) => {
      // console.error(event);
      this.shutDown();
    }
    this.socket.onclose = (event: CloseEvent) => {
      console.log(`closed: ${event}`);
      this.shutDown();
    }
    this.pingTimer = setInterval(() => {
      this.socket.send("ping");
    }, 1000);
      
  }

  private shutDown() {
    if (this.pingTimer) {
      console.log(`shutting down`);
      clearInterval(this.pingTimer);
    }
    setTimeout(() => {
      this.initSocket();
    }, 10000);
  }

  private onConnect(url: string) {
    console.log(`connected to ${url}`);
    
  }

  

  

}
