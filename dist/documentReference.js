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
exports.DocumentReference = void 0;
class DocumentReference {
    constructor(db, collectionName, docId) {
        this.db = db;
        this.collectionName = collectionName;
        this.docId = docId;
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.db.getDoc(this.collectionName, this.docId);
            return doc;
        });
    }
    getRowId() {
        return __awaiter(this, void 0, void 0, function* () {
            const rowId = yield this.db.getRowId(this.collectionName, this.docId);
            return rowId;
        });
    }
    set(docData, options = { merge: false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingDoc = yield this.get();
            if (existingDoc) {
                if (options === null || options === void 0 ? void 0 : options.merge) {
                    yield this.db.updateDoc(this.collectionName, Object.assign(Object.assign(Object.assign({}, existingDoc), docData), { id: this.docId }));
                }
                else {
                    yield this.db.updateDoc(this.collectionName, Object.assign(Object.assign({}, docData), { id: this.docId }));
                }
            }
            else {
                yield this.db.addDoc(this.collectionName, Object.assign(Object.assign({}, docData), { id: this.docId }));
            }
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.deleteDoc(this.collectionName, this.docId);
        });
    }
    onSnapshot(onNext) {
        return this.db.listen("change", (args) => {
            this.getRowId().then((rowId) => {
                if (args.table == this.collectionName && args.rowId == rowId) {
                    this.get().then(onNext);
                }
            });
        });
    }
}
exports.DocumentReference = DocumentReference;
