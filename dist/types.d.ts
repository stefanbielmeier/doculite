export interface ChangeEvent {
    eventType: string;
    database: string;
    table: string;
    rowId: string;
}
export type Collection = string;
export type SQL = string;
export type Events = {
    change: ChangeEvent;
    profile: SQL;
};
export type UnSubFn = () => void;
export type EventType = keyof Events;
export interface JsonStoreValue {
    [key: string]: any;
}
