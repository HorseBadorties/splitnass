/// <reference path="../../node_modules/@types/node/index.d.ts" />

import { createServer } from "http";
import * as express from "express";
import * as path from "path";
import * as socketIo from "socket.io";
import { Spieltag } from "../model/spieltag";

export class SplitnassServer {
    public static readonly PORT: number = 4200;
    // public static readonly mongoUrl: string = 'mongodb://localhost:27017/splitnass';
    public static readonly mongoUrl: string = "mongodb://admin:admin123@ds243931.mlab.com:43931/splitnass";

    public port = process.env.PORT || SplitnassServer.PORT;
    private app: express.Application;
    private websocket: socketIo.Server;
    private aktSpieltag: Spieltag;

    constructor() {
      this.app = express();
      // // Parse application/json
      // this.app.use(bodyParser.json());
      // // Parse application/vnd.api+json as json
      // this.app.use(bodyParser.json({ type: "application/vnd.api+json" }));
      // // Parse application/x-www-form-urlencoded
      // this.app.use(bodyParser.urlencoded({ extended: true }));

      // Run the app by serving the static files
      // in the dist directory
      this.app.use(express.static(__dirname + "/../../dist/splitnass-table"));

      // For all GET requests, send back index.html
      // so that PathLocationStrategy can be used
      this.app.get("/*", function(req, res) {
        res.sendFile(path.join(__dirname + "/../../dist/splitnass-table/index.html"));
      });
      const server = createServer(this.app);
      this.websocket = socketIo(server);
      this.websocket.origins("*:*");
      this.websocket.on("connect", socket => {
          console.log(`Client ${socket.client.id} connected`);
          socket.on("disconnect", () => {
              console.log(`Client ${socket.client.id} disconnected`);
          });
          socket.on("spieltag", data => {
            console.log(`sending updated spieltag`);
            this.aktSpieltag = data;
            this.websocket.compress(true).emit("spieltag", data);
        });
        socket.on("lastSpieltag", _ => {
            if (this.aktSpieltag) {
                console.log(`sending last spieltag`);
                socket.compress(true).emit("lastSpieltag", this.aktSpieltag);
                // setTimeout(() => socket.compress(true).emit("lastSpieltag", this.aktSpieltag), 3000);
            }
        });
      });
      // start server

      server.listen(this.port, () => {
        console.log(`Splitnass server running on port ${this.port}`);
      });
    }

    public getApp(): express.Application {
        return this.app;
    }

}

const splitnassServer = new SplitnassServer();
export { splitnassServer };
