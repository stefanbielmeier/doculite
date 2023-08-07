"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const sqlite_1 = require("sqlite");
const collectionReference_1 = require("./collectionReference");
const pubsub_1 = require("./pubsub");
// core functionalities
// 1. Get a doc from a collection by any property on the doc
// 2. Get all docs from a collection by any property on the doc
// 3. Set a doc to a collection (Create or update)
// 4. Delete a doc from a collection
// 5. Listen to changes to a doc / multiple docs in a collection (get entire doc for every change)
// 6. Advantage: don't have to do indexes for subcollections.
class Database {
    constructor() {
        this.db = null;
        this.pubSub = (0, pubsub_1.PubSub)();
    }
    connectToDatabase(filename = "sqlite.db") {
        return __awaiter(this, void 0, void 0, function* () {
            const sqlite3 = require("sqlite3").verbose();
            // open
            const db = yield (0, sqlite_1.open)({
                filename: filename,
                driver: sqlite3.Database,
            });
            return db;
        });
    }
    // connect to DB
    getDb() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.db) {
                const db = yield this.connectToDatabase();
                // set
                this.db = db;
                // listen
                // this.db.on("profile", (sql: string) => {
                //   this.pubSub.publish("profile", sql);
                // });
                this.db.on("change", (eventType, database, table, rowId) => {
                    const changeEvent = {
                        eventType,
                        database,
                        table,
                        rowId,
                    };
                    this.pubSub.publish("change", changeEvent);
                });
                return db;
            }
            return this.db;
        });
    }
    listen(type, fn) {
        this.pubSub.subscribe(type, fn);
        return () => this.pubSub.unsubscribe(type, fn);
    }
    collection(collectionName) {
        return new collectionReference_1.CollectionReference(this, collectionName);
    }
    // set Doc to DB
    addDoc(collection, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
            try {
                yield this.createNewDoc(db, collection, doc);
            }
            catch (e) {
                console.log("error", e);
                return false;
            }
            return true;
        });
    }
    updateDoc(collection, newVals) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
            try {
                yield this.updateExistingDoc(db, collection, newVals);
            }
            catch (e) {
                console.log("error", e);
                return false;
            }
            return true;
        });
    }
    updateExistingDoc(db, collection, newVals) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!db)
                return;
            const partialQuery = `UPDATE ${collection} SET value = (json(?)) WHERE id == ?`;
            yield db.run(partialQuery, [JSON.stringify(newVals), newVals.id]);
        });
    }
    deleteDoc(collection, docId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
            if (!db)
                return;
            const partialQuery = `DELETE FROM ${collection} WHERE id == ?`;
            yield db.run(partialQuery, [docId]);
        });
    }
    // get doc from DB
    getDoc(collection, docId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
            const value = yield this.getDocFromCollection(db, collection, docId);
            return value;
        });
    }
    getRowId(collection, docId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
            const rowId = yield this.getRowIdFromCollection(db, collection, docId);
            return rowId;
        });
    }
    getRowIdFromCollection(db, collection, docId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!db)
                return;
            const partialQuery = `SELECT rowid FROM ${collection} WHERE id == ?`;
            const data = yield db.get(partialQuery, [docId]);
            return (data === null || data === void 0 ? void 0 : data.rowid) || null;
        });
    }
    getDocs(collection, propertyFilter, propertyValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
            const docs = yield this.filterDocsByProperty(db, collection, propertyFilter, propertyValue);
            return docs;
        });
    }
    filterDocsByProperty(db, collection, property, propertyValue) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!db)
                return;
            const partialQuery = `SELECT * FROM ${collection} WHERE json_extract(value, "$.${property}") == ?`;
            const rows = yield db.all(partialQuery, [propertyValue]);
            const docs = rows === null || rows === void 0 ? void 0 : rows.map((row) => JSON.parse(row.value));
            return docs;
        });
    }
    createCollection(db, collection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!db)
                return;
            const partialQuery = `CREATE TABLE IF NOT EXISTS ${collection} (
      value TEXT,
      id TEXT GENERATED ALWAYS AS (json_extract(value, "$.id")) VIRTUAL NOT NULL)`;
            yield db.exec(partialQuery);
        });
    }
    // function to insert something into the JSON database
    createNewDoc(db, collection, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!db)
                return;
            yield this.createCollection(db, collection);
            const partialQuery = `INSERT INTO ${collection} VALUES (json(?))`;
            const JSONdoc = JSON.stringify(doc); // convert the value to a JSON string
            yield db.run(partialQuery, [JSONdoc]);
        });
    }
    // function to get the value of a key
    getDocFromCollection(db, collection, docId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!db)
                return null;
            const partialQuery = `SELECT value FROM ${collection} WHERE id = ?`;
            const row = yield db.get(partialQuery, [docId]);
            if (!row) {
                return null;
            }
            const value = JSON.parse(row.value); // convert the JSON string back to an object
            return value;
        });
    }
}
exports.Database = Database;
