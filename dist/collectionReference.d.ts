import { Database } from "./database";
import { DocumentReference } from "./documentReference";
import { Query } from "./query";
export declare class CollectionReference {
    private db;
    private collectionName;
    constructor(db: Database, collectionName: string);
    doc(docId?: string): DocumentReference;
    where(property: string, value: string): Query;
}
