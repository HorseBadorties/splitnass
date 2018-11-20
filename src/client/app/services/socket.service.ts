import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import * as socketIo from "socket.io-client";
import { Spieltag } from "src/model/spieltag";

const LOCAL_SERVER_URL = `http://localhost:${4200}`;
const REMOTE_SERVER_URL = `https://splitnass.herokuapp.com`;

@Injectable({
  providedIn: "root"
})
export class SocketService {
  private socket;
  public spieltag = new BehaviorSubject<Spieltag>(undefined);

  constructor() {
    this.initSocket();
  }

  public sendSpieltag(spieltag: Spieltag): void {
    const data = Spieltag.toJSON(spieltag);
    this.socket.compress(true).emit("spieltagUpdated", data, spieltag.beginn);
  }

  public listSpieltage(resultCallback) {
    this.socket.on("listSpieltage", resultCallback);
    this.socket.emit("listSpieltage");
  }

  public joinSpieltag(beginn: Date, resultCallback) {
    this.socket.on("joinedSpieltag", resultCallback);
    this.socket.emit("joinSpieltag", beginn);
  }

  private initSocket(): void {
      this.socket = socketIo(LOCAL_SERVER_URL);
      this.socket.on("connect", _ => this.onConnect(LOCAL_SERVER_URL));
      this.socket.on("connect_error", _ => this.connectToRemoteServer());
      this.socket.on("connect_timeout", _ => this.connectToRemoteServer());
  }

  private onConnect(url: string) {
    console.log(`connected to ${url}`);
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
