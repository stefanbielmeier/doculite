import { randomUUID } from "crypto";
import { Database } from "./database";
import { DocumentReference } from "./documentReference";
import { Query } from "./query";

export class CollectionReference {
  private db: Database;
  private collectionName: string;

  constructor(db: Database, collectionName: string) {
    this.db = db;
    this.collectionName = collectionName;
  }

  public doc(docId?: string) {
    if (!docId)
      return new DocumentReference(this.db, this.collectionName, randomUUID());
    return new DocumentReference(this.db, this.collectionName, docId);
  }

  public where(property: string, value: string) {
    // Create a Query object and return it
    return new Query(this.db, this.collectionName, property, value);
  }
}
