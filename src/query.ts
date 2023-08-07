import { Database } from "./database";
import { ChangeEvent } from "./types";

export class Query {
  private db: Database;
  private collectionName: string;
  private property: string;
  private propertyValue: string;

  constructor(
    db: Database,
    collectionName: string,
    property: string,
    propertyValue: string
  ) {
    this.db = db;
    this.collectionName = collectionName;
    this.property = property;
    this.propertyValue = propertyValue;
  }

  public async get() {
    const docs = await this.db.getDocs(
      this.collectionName,
      this.property,
      this.propertyValue
    );
    return docs;
  }

  public onSnapshot(onNext: (docs: any[] | undefined) => void) {
    return this.db.listen("change", (args: ChangeEvent) => {
      if (args.table == this.collectionName) {
        this.get().then(onNext);
      }
    });
  }
}
