/// <reference path="../../node_modules/@types/node/index.d.ts" />

import * as socketIo from "socket.io";
import { SplitnassServer } from "./server";

export class WebsocketServer {
  private io: socketIo.Server;
  private rooms = new Map<string, string>(); // client.id to Spieltag.beginn
  private admins = new Map<string, string>(); // Spieltag.beginn to client.id

  constructor(private splitnassServer: SplitnassServer) {
    this.io = socketIo(splitnassServer.getHttpServer());
    this.io.origins("*:*");
    this.io.on("connect", socket => this.onConnect(socket));
    console.log(`WebsocketServer started`);
  }

  private onConnect(socket: socketIo.Socket) {
    console.log(`Client ${socket.client.id} connected`);
    socket.on("disconnect", () => {
      this.rooms.delete(socket.client.id);
      this.removeAsAdmin(socket);
      console.log(`Client ${socket.client.id} disconnected`);
    });
    socket.on("spieltagUpdated", (spieltagJSON: string, beginnJSON: string) => {
      if (this.makeAdminFor(socket, beginnJSON)) {
        this.addClientToRoom(socket, beginnJSON);
        console.log(`spieltag ${beginnJSON} got updated`);
        this.io.compress(true).to(beginnJSON).emit("spieltagUpdated", spieltagJSON);
        this.splitnassServer.spieltagUpdate(spieltagJSON);
      } else {
        // client was trying to update the Spieltag but is not an admin
        console.log(`spieltag ${beginnJSON} not updated because ${socket.client.id} is not the admin`);
        socket.emit("message", { severity: "error", summary: "Keine Änderungsrechte",
          detail: "Der Spieltag wird von jemand anderem gesteuert!" });
      }
    });
    socket.on("message", message => socket.broadcast.emit("message", message));
    socket.on("listSpieltage", () => {
      this.splitnassServer.listSpieltage().then(list => {
        console.log(`sending list of spieltage`);
        socket.emit("listSpieltage", list);
      });
    });
    socket.on("joinSpieltag", beginnJSON => {
      this.splitnassServer.getSpieltag(beginnJSON).then(spieltag => {
        if (spieltag) {
          this.addClientToRoom(socket, beginnJSON);
          socket.emit("joinedSpieltag", JSON.stringify(spieltag));
        } else {
          socket.emit("joinedSpieltag", undefined);
        }
      });
    });
  }

  private makeAdminFor(clientSocket: socketIo.Socket, room: string) {
    const currentAdmin = this.admins.get(room);
    if (currentAdmin === clientSocket.client.id) { // client is admin already
      return true;
    } else if (!currentAdmin) { // make him admin
      this.admins.set(room, clientSocket.client.id);
      console.log(`client ${clientSocket.client.id} now admin of ${room}`);
      return true;
    } else { // there is already another admin
      return false;
    }
  }

  private removeAsAdmin(clientSocket: socketIo.Socket) {
    this.admins.forEach((v, k, m) => {
      if (v === clientSocket.client.id) m.delete(k);
    });
  }

  private addClientToRoom(clientSocket: socketIo.Socket, room: string) {
    if (this.rooms.get(clientSocket.client.id) !== room) {
      this.removeAsAdmin(clientSocket);
      clientSocket.leave(this.rooms.get(clientSocket.client.id));
      clientSocket.join(room);
      this.rooms.set(clientSocket.client.id, room);
      console.log(`client ${clientSocket.client.id} joined ${room}`);
    }
  }

}
