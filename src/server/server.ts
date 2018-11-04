/// <reference path="../../node_modules/@types/node/index.d.ts" />

import { createServer } from "http";
import * as express from "express";
import * as path from "path";
import * as socketIo from "socket.io";
import { MongoClient, MongoError, Db, Collection } from "mongodb";

import { Spieltag } from "../model/spieltag";

export class SplitnassServer {
    public static readonly PORT: number = 4200;
    // public static readonly mongoUrl: string = 'mongodb://localhost:27017/splitnass';
    public static readonly mongoUrl: string = "mongodb://admin:admin123@ds243931.mlab.com:43931/splitnass";

    public port = process.env.PORT || SplitnassServer.PORT;
    private app: express.Application;
    private websocket: socketIo.Server;
    private db: Db;
    private dbCollection: Collection;
    private aktSpieltag: string;

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
        this.app.use(express.static(__dirname + "/../../dist/splitnass"));

        // For all GET requests, send back index.html
        // so that PathLocationStrategy can be used
        this.app.get("/*", function (req, res) {
            res.sendFile(path.join(__dirname + "/../../dist/splitnass/index.html"));
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
                if (this.dbCollection) {
                    const spieltagObject = JSON.parse(data);
                    this.dbCollection.replaceOne({ "key": spieltagObject.key },
                        spieltagObject, { "upsert": true }, (_err: MongoError, result: any) => {
                            if (_err) {
                                console.error(_err);
                            } else {
                                console.log(`updated ${spieltagObject.key} on db`);
                            }
                        });
                }
            });
            socket.on("lastSpieltag", _ => {
                if (this.aktSpieltag) {
                    console.log(`sending last spieltag`);
                    socket.compress(true).emit("lastSpieltag", this.aktSpieltag);
                    // setTimeout(() => socket.compress(true).emit("lastSpieltag", this.aktSpieltag), 3000);
                }
            });
        });

        // MongoDB
        MongoClient.connect(SplitnassServer.mongoUrl, { useNewUrlParser: true },
            (_err: MongoError, _db: Db) => {
                console.log(`successfully connected to ${SplitnassServer.mongoUrl}`);
                this.db = _db.db("splitnass");
                this.db.createCollection("spieltag", (_err2: MongoError, _coll: Collection) => {
                    if (!_err2) {
                        this.dbCollection = _coll;
                        this.readLatestSpieltagFromDB();
                    }
                });
            });

        // start server
        server.listen(this.port, () => {
            console.log(`Splitnass server running on port ${this.port}`);
        });
    }

    private readLatestSpieltagFromDB() {
        this.dbCollection.find({}).sort({ key: -1 }).limit(1).next((_err: MongoError, result: any) => {
            if (!_err && result) {
                this.aktSpieltag = JSON.stringify(result);
                console.log(`Read latest Spieltag ${result.key} from db`);
            }
        });
    }

    public getApp(): express.Application {
        return this.app;
    }

}

const splitnassServer = new SplitnassServer();
export { splitnassServer };
