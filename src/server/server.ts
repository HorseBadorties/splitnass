/// <reference path="../../node_modules/@types/node/index.d.ts" />

import { Server as HttpServer } from "http";
import * as express from "express";
import * as path from "path";

import { DB } from "./db";
import { WebsocketServer } from "./websocket.server";

export class SplitnassServer {
  public static readonly PORT: number = 4200;
  // public static readonly mongoUrl: string = "mongodb://localhorst:27017/splitnass";
  public static readonly mongoUrl: string = "mongodb://admin:admin123@ds243931.mlab.com:43931/splitnass";

  public port = process.env.PORT || SplitnassServer.PORT;
  private app: express.Application;
  private httpServer: HttpServer;
  private websocketServer: WebsocketServer;
  private db: DB;

  constructor() {
    this.app = express();
    this.app.use(express.static(__dirname + "/../../dist/splitnass"));
    this.app.get("/*", function (req, res) {
      res.sendFile(path.join(__dirname + "/../../dist/splitnass/index.html"));
    });

    this.httpServer = new HttpServer(this.app);

    try {
      this.websocketServer = new WebsocketServer(this);
    } catch (error) {
      console.error("Failed to start WebsocketServer");
      console.error(error);
    }

    try {
      this.db = new DB(this);
    } catch (error) {
      console.error("Failed to connect to DB");
      console.error(error);
    }

    // start server
    this.httpServer.listen(this.port, () => {
      console.log(`Splitnass server running on port ${this.port}`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getHttpServer(): HttpServer {
    return this.httpServer;
  }

  public getWebsocketServer(): WebsocketServer {
    return this.websocketServer;
  }

  public spieltagUpdate(spieltagJson: string) {
    if (this.db) {
      this.db.updateSpieltag(spieltagJson);
    }
  }

  public latestSpieltag(spieltagJson: string) {
    if (this.websocketServer) {
      this.websocketServer.aktSpieltag = spieltagJson;
    }
  }

}

const splitnassServer = new SplitnassServer();
export { splitnassServer };
