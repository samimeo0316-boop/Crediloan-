import { db } from "./firebase.js";
import { currentUser } from "./auth.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Collection
function userCollection() {
  return collection(db, "transactions");
}

// Save
export async function saveTransaction(data) {

  const user = currentUser();

  if (!user) {
    throw new Error("Please login first");
  }

  data.uid = user.uid;

  await addDoc(userCollection(), data);

}

// Load
export async function loadTransactions() {

  const user = currentUser();

  if (!user) return [];

  const q = query(
    userCollection(),
    where("uid", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  const list = [];

  snapshot.forEach((d) => {

    list.push({
      id: d.id,
      ...d.data()
    });

  });

  return list;

}

// Update
export async function updateTransaction(id, data) {

  await updateDoc(
    doc(db, "transactions", id),
    data
  );

}

// Delete
export async function deleteTransaction(id) {

  await deleteDoc(
    doc(db, "transactions", id)
  );

}

export async function syncTransactions() {
    return await loadTransactions();
}

export async function restoreTransactions(data) {
    for (const item of data) {
        await saveTransaction(item);
    }
}