export interface ChangeEvent {
  eventType: string; //"insert"
  database: string; // "main"
  table: string; // "wishlists"
  rowId: string; // position of doc in collection
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
