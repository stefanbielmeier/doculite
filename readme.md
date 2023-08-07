# Doculite

DocuLite lets you use SQLite like Firebase Firestore. It's written in Typescript and an adapter on top of sqlite3 and sqlite. It support listeners on documents, collections, and basic queries. Feedback & Bugs to thedoculite@gmail.com.
This is early work, so please treat it appropriately.

# Current features

## 1. Initialize a DB

Example:

```
import { Database } from "doculite"

// Creates sqlite.db file in the cwd
const db = new Database();

```

## 2. Create Collections and Set Documents

Collections are created on first insertion of a document. They are represented by a SQLite Table.

```
// create ref to the doc. Doc ID optional.

const usersRef = db.collection("users").doc("123");
const refWithoutId = db.collection("users").doc();

// Any valid Javascript object that can be parsed to valid JSON can be inserted as a document.

await usersRef.set({ username: "John Doe", createdAt: "123", updatedAt: "123" });
await refWithoutId.set({ username: "Jane Doe" });

```

## 3. Get a particular document

```
// define ref
const usersRef = db.collection("users").doc("123");
// get
const user = await usersRef.get();
// print
console.log(user); // prints { username: "John Doe" };

```

## 4. Update Documents in Collections

```
// ref
const usersRef = db.collection("users").doc("123");

// Properties existing on both old and new object will be updated.
// Properties only existing on the new object will be added.

// If merge is false, properties only present on the old object will be deleted.
// Merge is true by default

await ref.set({ username: "DERP Doe", updatedAt: "345" }, { merge: true });
// document in DB is now { username: "DERP Doe", updatedAt: "345", createdAt: "123" }

await ref.set({ username: "DERP Doe", updatedAt: "345" }, { merge: false });
// document in DB is now { username: "DERP Doe", updatedAt: "345" }

```

## 5. Delete Documents in Collection

```
const db = new Database();

const ref = db.collection("users").doc("deletable");

await ref.set({ username: "deletableUsername", updatedAt: 123123 });

await ref.delete();

const doc = await ref.get();

console.log(doc) // prints null

```

## 6. Listen to real-time updates of documents.

```

// ref to doc
const ref = db.collection("users").doc("123");

// snapshot listener returns unsubscribe function
const unsub = ref.onSnapshot((doc) => {
console.log("Omg the user doc is updating!", doc?.username);
});

await ref.set({ username: "SHEESH Doe", updatedAt: 2 });
// prints: `Omg the user doc is updating! SHEESH Doe`

// unsub
unsub();

```

## 7. Query Documents in a collection by equality comparison

```

const usersRef = db.collection("users");

await usersRef.doc().set({ username: "Doculite", updatedAt: 234 });

const query = usersRef.where("username", "Doculite");

const docs = await query.get();

const user = docs[0]

console.log(user.username) // prints `Doculite`

```

# Potential roadmap:

1. Better query-based system
2. Stability and speed updates
3. Delete collections
4. Subcollections
5. Listeners on queries / multiple documents
6. Queries with other comparison operators (<, >, >=, <=, contains, etc.)
7. Queries for multiple variables (without indexes, probably)
8. Queries with Full Text Search (without indexes, probably)

```

```
