import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreError,
} from "firebase/firestore";

const firebaseConfig = {
  // Поместите сюда ваши значения (или читайте из env)
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  // ...
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export function subscribeToCollection(
  path: string,
  cb: (docs: Array<{ id: string; data: DocumentData }>) => void
) {
  const colRef = collection(db, path);
  return onSnapshot(
    colRef,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const docs = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        data: doc.data(),
      }));
      cb(docs);
    },
    (error: FirestoreError) => {
      console.error("Firestore onSnapshot error:", error);
    }
  );
}