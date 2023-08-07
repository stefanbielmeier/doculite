import { Database } from "./database";
export declare class Query {
    private db;
    private collectionName;
    private property;
    private propertyValue;
    constructor(db: Database, collectionName: string, property: string, propertyValue: string);
    get(): Promise<any[]>;
    onSnapshot(onNext: (docs: any[] | undefined) => void): import("./types").UnSubFn;
}
