import { CollectionReference } from "./collectionReference";
import { MessageFn } from "./pubsub";
import { ChangeEvent, Collection, JsonStoreValue, UnSubFn } from "./types";
export declare class Database {
    private db;
    private pubSub;
    constructor();
    private connectToDatabase;
    private getDb;
    listen(type: "change", fn: MessageFn<ChangeEvent>): UnSubFn;
    collection(collectionName: string): CollectionReference;
    addDoc(collection: Collection, doc: JsonStoreValue): Promise<boolean>;
    updateDoc(collection: Collection, newVals: JsonStoreValue): Promise<boolean>;
    private updateExistingDoc;
    deleteDoc(collection: Collection, docId: string): Promise<void>;
    getDoc(collection: Collection, docId: string): Promise<JsonStoreValue>;
    getRowId(collection: Collection, docId: string): Promise<any>;
    private getRowIdFromCollection;
    getDocs(collection: Collection, propertyFilter: string, propertyValue: string): Promise<any[]>;
    private filterDocsByProperty;
    private createCollection;
    private createNewDoc;
    private getDocFromCollection;
}
