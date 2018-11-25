import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Message } from "primeng/api";

import * as socketIo from "socket.io-client";
import { Spieltag } from "src/model/spieltag";

const LOCAL_SERVER_URL = `http://localhost:${4200}`;
const REMOTE_SERVER_URL = `https://splitnass.herokuapp.com`;

@Injectable({
  providedIn: "root"
})
export class SocketService {
  private socket;
  public spieltag = new Subject<Spieltag>();
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
    this.socket.on("listSpieltage", list => this.spieltagList.next(list));
    this.socket.emit("listSpieltage");
  }

  public joinSpieltag(beginn: string) {
    this.socket.on("joinedSpieltag", s => this.joinedSpieltag.next(s));
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
      this.socket.on("message", message => this.messages.next(message));
  }

  private onConnect(url: string) {
    console.log(`connected to ${url}`);
    this.connected.next(true);    
    this.socket.on("spieltagUpdated", (data: string) => {
      console.log(`received updated spieltag`);
      this.nextSpieltag(data);
    });
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
