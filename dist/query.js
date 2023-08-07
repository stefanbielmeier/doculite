"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
class Query {
    constructor(db, collectionName, property, propertyValue) {
        this.db = db;
        this.collectionName = collectionName;
        this.property = property;
        this.propertyValue = propertyValue;
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield this.db.getDocs(this.collectionName, this.property, this.propertyValue);
            return docs;
        });
    }
    onSnapshot(onNext) {
        return this.db.listen("change", (args) => {
            if (args.table == this.collectionName) {
                this.get().then(onNext);
            }
        });
    }
}
exports.Query = Query;
