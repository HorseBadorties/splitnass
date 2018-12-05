import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Message } from "primeng/api";

import * as socketIo from "socket.io-client";
import { Spieltag } from "src/model/spieltag";

const LOCAL_SERVER_URL = `http://localhost:${63085}`;
const REMOTE_SERVER_URL = `https://splitnass.herokuapp.com`;
// const REMOTE_SERVER_URL = `http://schruv.deneb.uberspace.de:63085`;

@Injectable({
  providedIn: "root"
})
export class SocketService {
  private socket;
  public spieltag = new Subject<Spieltag>();
  private _joinedSpieltagBeginn: string;
  public joinedSpieltag = new Subject<string>();
  public spieltagList = new Subject<Array<Spieltag>>();
  public connected = new Subject<boolean>();
  public messages = new Subject<Message>();

  constructor() {
    this.initSocket();
  }

  public sendSpieltag(spieltag: Spieltag): void {
    const data = Spieltag.toJSON(spieltag);
    console.log(`sending spieltag update`);
    this.socket.compress(true).emit("spieltagUpdated", data, spieltag.beginn);
  }

  public listSpieltage() {
    this.socket.on("listSpieltage", list => {
      this.socket.off("listSpieltage");
      this.spieltagList.next(list);
    });
    this.socket.emit("listSpieltage");
  }

  public joinSpieltag(beginn: string) {
    this.socket.on("joinedSpieltag", s => {
      this.socket.off("joinedSpieltag");
      this._joinedSpieltagBeginn = beginn;
      this.joinedSpieltag.next(s);
    });
    this.socket.emit("joinSpieltag", beginn);
  }

  public sendMessage(message: Message) {
    this.socket.emit("message", message);
  }

  private initSocket(): void {
      this.socket = socketIo(LOCAL_SERVER_URL);
      this.socket.on("connect", _ => this.onConnect(LOCAL_SERVER_URL));
      this.socket.on("connect_error", _ => this.connectToRemoteServer());
      this.socket.on("connect_timeout", _ => this.connectToRemoteServer());
  }

  private onConnect(url: string) {
    console.log(`connected to ${url} using ${this.socket.io.engine.transport.name}`);
    // unregister bogus listeners due to https://github.com/socketio/socket.io/issues/3259
    this.socket.off("disconnect");
    this.socket.off("spieltagUpdated");
    this.socket.off("message");
    // register new listeners
    this.socket.on("disconnect", reason => this.onDisconnect(reason));
    this.connected.next(true);    
    this.socket.on("spieltagUpdated", (data: string) => {
      console.log(`received updated spieltag`);
      this.nextSpieltag(data);
    });    
    this.socket.on("message", message => this.messages.next(message));
    // re-join Spieltag after a disconnect/reconnect
    if (this._joinedSpieltagBeginn) {
      this.joinSpieltag(this._joinedSpieltagBeginn);
    }
  }

  private onDisconnect(reason: string) {
    console.log(`got disconnected due to ${reason}`);
    this.connected.next(false);
  }

  private connectToRemoteServer() {
    if (this.socket) {
      this.socket.close();
    }
    this.socket = socketIo(REMOTE_SERVER_URL);
    this.socket.on("connect", _ => this.onConnect(REMOTE_SERVER_URL));
  }

  private nextSpieltag(data: string) {
    this.spieltag.next(Spieltag.fromJSON(data));
  }

}
