import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject  } from "rxjs";

import * as socketIo from "socket.io-client";
import { Spieltag } from "../../../model/spieltag";

const LOCAL_SERVER_URL = `http://localhost:${4200}`;
const REMOTE_SERVER_URL = `https://splitnass-table.herokuapp.com`;

@Injectable({
  providedIn: "root"
})
export class SocketService {
  private socket;
  public lastSpieltag: Spieltag;
  public updatedSpieltag = new BehaviorSubject(undefined);


  constructor() {
    this.initSocket();
  }

  public sendSpieltag(spieltag: Spieltag): void {
    const data = Spieltag.toJSON(spieltag);
    this.socket.compress(true).emit("spieltag", data);
  }

  private initSocket(): void {
      this.socket = socketIo(LOCAL_SERVER_URL);
      this.socket.on("connect", _ => this.onConnect(LOCAL_SERVER_URL));
      this.socket.on("connect_error", _ => this.connectToRemoteServer());
      this.socket.on("connect_timeout", _ => this.connectToRemoteServer());
  }

  private onConnect(url: string) {
    console.log(`connected to ${url}`);
    this.socket.on("spieltag", (data: string) => {
      console.log(`sending spieltag`);
      this.nextSpieltag(data);
    });
    this.requestLastSpieltag();
  }

  private connectToRemoteServer() {
    if (this.socket) {
      this.socket.close();
    }
    this.socket = socketIo(REMOTE_SERVER_URL);
    this.socket.on("connect", _ => this.onConnect(REMOTE_SERVER_URL));
  }


  private requestLastSpieltag() {
    this.socket.on("lastSpieltag", (data: string) => {
      console.log(`sending last spieltag`);
      this.nextSpieltag(data);
    });
    this.socket.emit("lastSpieltag", "");
  }

  private nextSpieltag(data: string) {
    this.lastSpieltag = Spieltag.fromJSON(data);
    this.updatedSpieltag.next(this.lastSpieltag);
  }

}
