import { Database } from "./database";
import { JsonStoreValue } from "./types";
type SetOptions = {
    merge: boolean;
};
export declare class DocumentReference {
    private db;
    private collectionName;
    private docId;
    constructor(db: Database, collectionName: string, docId: string);
    get(): Promise<JsonStoreValue>;
    getRowId(): Promise<any>;
    set(docData: JsonStoreValue, options?: SetOptions): Promise<void>;
    delete(): Promise<void>;
    onSnapshot(onNext: (snapshot: JsonStoreValue | null) => void): import("./types").UnSubFn;
}
export {};
