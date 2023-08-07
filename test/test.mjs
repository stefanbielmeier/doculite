import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Database } from "../dist/index.js";

// write a bunch o
describe("listener", () => {
  it("should listen", async () => {
    const db = new Database();

    const usersRef = db.collection("users").doc("123");

    await usersRef.set({ username: "John Doe", updatedAt: 123123 });

    const ref = db.collection("users").doc("123");

    const unsub = ref.onSnapshot((doc) => {
      console.log("Omg the user doc is updating!", doc);
      assert.strictEqual(doc?.username, "JANE Doe");
    });

    await ref.set({ username: "JANE Doe", updatedAt: 1 }, { merge: false });

    unsub();
  });
});
describe("should delete", () => {
  it("should delete", async () => {
    const db = new Database();

    const ref = db.collection("users").doc("deletable");

    await ref.set({ username: "John Doe", updatedAt: 123123 });

    await ref.delete();

    const doc = await ref.get();

    assert.strictEqual(doc, null);
  });
});

describe("query", () => {
  it("should query", async () => {
    const db = new Database();

    const usersRef = db.collection("users");

    await usersRef.doc().set({ username: "Doculite", updatedAt: 234 });

    const query = usersRef.where("username", "Doculite");

    const docs = await query.get();

    assert.strictEqual(docs[0]?.username, "Doculite");
  });
});

describe("docRef", () => {
  it("should get null if it doesn't exist!", async () => {
    const db = new Database();
    const usersRef = db.collection("users").doc("22");
    const user = await usersRef.get();
    assert.strictEqual(user?.username, undefined);
    assert.strictEqual(user, null);
  });
  it("should get an old doc", async () => {
    const db = new Database();
    const usersRef = db.collection("users").doc("123");
    const user = await usersRef.get();
    assert.strictEqual(user?.username, "JANE Doe");
  });
  it("should get a doc", async () => {
    const db = new Database();
    const usersRef = db.collection("users").doc("derp");
    await usersRef.set({
      username: "Johnny Derp",
      updatedAt: 123123,
      lit: true,
    });
    const user = await usersRef.get();
    assert.strictEqual(user?.username, "Johnny Derp");
    assert.strictEqual(user?.lit, true);
  });
  it("should be able to update the docc", async () => {
    const db = new Database();
    const usersRef = db.collection("users").doc("derp");
    await usersRef.set({ lit: false });
    const user = await usersRef.get();
    assert.strictEqual(user?.lit, false);
  });
});
