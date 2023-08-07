import { Database as SQLDb, open } from "sqlite";
import { CollectionReference } from "./collectionReference";
import { MessageFn, PubSub } from "./pubsub";
import {
  ChangeEvent,
  Collection,
  Events,
  JsonStoreValue,
  UnSubFn,
} from "./types";

// core functionalities
// 1. Get a doc from a collection by any property on the doc
// 2. Get all docs from a collection by any property on the doc
// 3. Set a doc to a collection (Create or update)
// 4. Delete a doc from a collection
// 5. Listen to changes to a doc / multiple docs in a collection (get entire doc for every change)
// 6. Advantage: don't have to do indexes for subcollections.

export class Database {
  private db: SQLDb | null;
  private pubSub;

  constructor() {
    this.db = null;
    this.pubSub = PubSub<Events>();
  }

  private async connectToDatabase(
    filename: string = "sqlite.db"
  ): Promise<SQLDb> {
    const sqlite3 = require("sqlite3").verbose();

    // open
    const db = await open({
      filename: filename,
      driver: sqlite3.Database,
    });

    return db;
  }

  // connect to DB
  private async getDb(): Promise<SQLDb | null> {
    if (!this.db) {
      const db = await this.connectToDatabase();
      // set
      this.db = db;
      // listen
      // this.db.on("profile", (sql: string) => {
      //   this.pubSub.publish("profile", sql);
      // });
      this.db.on(
        "change",
        (eventType: string, database: string, table: string, rowId: string) => {
          const changeEvent: ChangeEvent = {
            eventType,
            database,
            table,
            rowId,
          };
          this.pubSub.publish("change", changeEvent);
        }
      );

      return db;
    }

    return this.db;
  }

  public listen(type: "change", fn: MessageFn<ChangeEvent>): UnSubFn {
    this.pubSub.subscribe(type, fn);
    return () => this.pubSub.unsubscribe(type, fn);
  }

  public collection(collectionName: string) {
    return new CollectionReference(this, collectionName);
  }

  // set Doc to DB
  public async addDoc(
    collection: Collection,
    doc: JsonStoreValue
  ): Promise<boolean> {
    const db = await this.getDb();

    try {
      await this.createNewDoc(db, collection, doc);
    } catch (e) {
      console.log("error", e);
      return false;
    }

    return true;
  }

  public async updateDoc(
    collection: Collection,
    newVals: JsonStoreValue
  ): Promise<boolean> {
    const db = await this.getDb();

    try {
      await this.updateExistingDoc(db, collection, newVals);
    } catch (e) {
      console.log("error", e);
      return false;
    }

    return true;
  }

  private async updateExistingDoc(
    db: SQLDb | null,
    collection: Collection,
    newVals: JsonStoreValue
  ) {
    if (!db) return;

    const partialQuery = `UPDATE ${collection} SET value = (json(?)) WHERE id == ?`;

    await db.run(partialQuery, [JSON.stringify(newVals), newVals.id]);
  }

  public async deleteDoc(collection: Collection, docId: string) {
    const db = await this.getDb();

    if (!db) return;

    const partialQuery = `DELETE FROM ${collection} WHERE id == ?`;

    await db.run(partialQuery, [docId]);
  }

  // get doc from DB
  public async getDoc(collection: Collection, docId: string) {
    const db = await this.getDb();

    const value = await this.getDocFromCollection(db, collection, docId);

    return value;
  }

  public async getRowId(collection: Collection, docId: string) {
    const db = await this.getDb();

    const rowId = await this.getRowIdFromCollection(db, collection, docId);

    return rowId;
  }

  private async getRowIdFromCollection(
    db: SQLDb | null,
    collection: Collection,
    docId: string
  ) {
    if (!db) return;

    const partialQuery = `SELECT rowid FROM ${collection} WHERE id == ?`;

    const data = await db.get(partialQuery, [docId]);

    return data?.rowid || null;
  }

  public async getDocs(
    collection: Collection,
    propertyFilter: string,
    propertyValue: string
  ) {
    const db = await this.getDb();

    const docs = await this.filterDocsByProperty(
      db,
      collection,
      propertyFilter,
      propertyValue
    );

    return docs;
  }

  private async filterDocsByProperty(
    db: SQLDb | null,
    collection: Collection,
    property: string,
    propertyValue: string
  ) {
    if (!db) return;

    const partialQuery = `SELECT * FROM ${collection} WHERE json_extract(value, "$.${property}") == ?`;

    const rows = await db.all(partialQuery, [propertyValue]);

    const docs = rows?.map((row) => JSON.parse(row.value));

    return docs;
  }

  private async createCollection(db: SQLDb | null, collection: Collection) {
    if (!db) return;

    const partialQuery = `CREATE TABLE IF NOT EXISTS ${collection} (
      value TEXT,
      id TEXT GENERATED ALWAYS AS (json_extract(value, "$.id")) VIRTUAL NOT NULL)`;

    await db.exec(partialQuery);
  }

  // function to insert something into the JSON database
  private async createNewDoc(
    db: SQLDb | null,
    collection: Collection,
    doc: JsonStoreValue
  ): Promise<void> {
    if (!db) return;

    await this.createCollection(db, collection);

    const partialQuery = `INSERT INTO ${collection} VALUES (json(?))`;

    const JSONdoc = JSON.stringify(doc); // convert the value to a JSON string
    await db.run(partialQuery, [JSONdoc]);
  }

  // function to get the value of a key
  private async getDocFromCollection(
    db: SQLDb | null,
    collection: Collection,
    docId: string
  ): Promise<JsonStoreValue | null> {
    if (!db) return null;

    const partialQuery = `SELECT value FROM ${collection} WHERE id = ?`;

    const row = await db.get(partialQuery, [docId]);

    if (!row) {
      return null;
    }

    const value = JSON.parse(row.value); // convert the JSON string back to an object
    return value;
  }
}
