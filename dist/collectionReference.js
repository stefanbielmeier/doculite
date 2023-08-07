"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionReference = void 0;
const crypto_1 = require("crypto");
const documentReference_1 = require("./documentReference");
const query_1 = require("./query");
class CollectionReference {
    constructor(db, collectionName) {
        this.db = db;
        this.collectionName = collectionName;
    }
    doc(docId) {
        if (!docId)
            return new documentReference_1.DocumentReference(this.db, this.collectionName, (0, crypto_1.randomUUID)());
        return new documentReference_1.DocumentReference(this.db, this.collectionName, docId);
    }
    where(property, value) {
        // Create a Query object and return it
        return new query_1.Query(this.db, this.collectionName, property, value);
    }
}
exports.CollectionReference = CollectionReference;
