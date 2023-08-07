import { Database } from "./database";
import { ChangeEvent, JsonStoreValue } from "./types";

type SetOptions = {
  merge: boolean;
};

export class DocumentReference {
  private db: Database;
  private collectionName: string;
  private docId: string;

  constructor(db: Database, collectionName: string, docId: string) {
    this.db = db;
    this.collectionName = collectionName;
    this.docId = docId;
  }

  public async get() {
    const doc = await this.db.getDoc(this.collectionName, this.docId);
    return doc;
  }

  public async getRowId() {
    const rowId = await this.db.getRowId(this.collectionName, this.docId);
    return rowId;
  }

  public async set(
    docData: JsonStoreValue,
    options: SetOptions = { merge: false }
  ) {
    const existingDoc = await this.get();

    if (existingDoc) {
      if (options?.merge) {
        await this.db.updateDoc(this.collectionName, {
          ...existingDoc,
          ...docData,
          id: this.docId,
        });
      } else {
        await this.db.updateDoc(this.collectionName, {
          ...docData,
          id: this.docId,
        });
      }
    } else {
      await this.db.addDoc(this.collectionName, { ...docData, id: this.docId });
    }
  }

  public async delete() {
    await this.db.deleteDoc(this.collectionName, this.docId);
  }

  public onSnapshot(onNext: (snapshot: JsonStoreValue | null) => void) {
    return this.db.listen("change", (args: ChangeEvent) => {
      this.getRowId().then((rowId) => {
        if (args.table == this.collectionName && args.rowId == rowId) {
          this.get().then(onNext);
        }
      });
    });
  }
}
