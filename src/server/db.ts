/// <reference path="../../node_modules/@types/node/index.d.ts" />

import { MongoClient, MongoError, Db, Collection } from "mongodb";
import { SplitnassServer } from "./server";

export class DB {
  public static readonly mongoUrl: string = "mongodb://localhost:27017/splitnass";
  // public static readonly mongoUrl: string = "mongodb://client:client@localhost:31664/splitnass"; // uberspace port 31664
  // public static readonly mongoUrl: string = "mongodb://admin:admin123@ds243931.mlab.com:43931/splitnass";

  private db: Db;
  private dbCollection: Collection;

  constructor(private splitnassServer: SplitnassServer) {
    MongoClient.connect(DB.mongoUrl, { useNewUrlParser: true },
      (_err: MongoError, _db: Db) => {
        if (_err) throw (_err);
        this.db = _db.db("splitnass");
        this.db.createCollection("spieltag", (_err2: MongoError, _coll: Collection) => {
          if (_err2) throw (_err2);
          this.dbCollection = _coll;
          console.log(`successfully connected to ${DB.mongoUrl}`);
          this.splitnassServer.dbSuccessfullyInitialized();
        });
      });

  }

  public updateSpieltag(spieltagJson: string) {
    if (this.dbCollection) {
      const spieltagObject = JSON.parse(spieltagJson);
      this.dbCollection.replaceOne({ "beginn": spieltagObject.beginn },
        spieltagObject, { "upsert": true }, (_err: MongoError, result: any) => {
          if (_err) {
            console.error(_err);
          } else {
            console.log(`updated ${spieltagObject.beginn} on db`);
          }
        });
    }
  }

  public listSpieltage(): Promise<Array<Object>> {
    return this.dbCollection.find({}/*, {projection: {name: 1, beginn: 1}}*/).sort({ beginn: -1 }).toArray();
  }

  public getSpieltag(beginn: Date): Promise<Object> {
    return this.dbCollection.find({beginn: beginn}).next();
  }
}

