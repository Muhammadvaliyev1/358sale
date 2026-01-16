import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  QuerySnapshot,
  DocumentData,
  FirestoreError,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVlamAzx_irw6gRPapHzt88c17-VHa-uM",
  authDomain: "shop-c5488.firebaseapp.com",
  projectId: "shop-c5488",
  storageBucket: "shop-c5488.firebasestorage.app",
  messagingSenderId: "199296594637",
  appId: "1:199296594637:web:f6b8071bd9ed245605ef84",
  measurementId: "G-1XT2HXS61B",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const firebaseDb = {
  subscribe: (
    collectionName: string,
    callback: (data: any[]) => void
  ) => {
    try {
      const q = query(collection(db, collectionName));

      return onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const data = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          callback(data);
        },
        (error: FirestoreError) => {
          console.error(
            `Ошибка подписки на ${collectionName}:`,
            error
          );
        }
      );
    } catch (e: unknown) {
      console.error("Ошибка Firebase:", e);
      return () => {};
    }
  },

  save: async (
    collectionName: string,
    id: string,
    data: Record<string, unknown>
  ) => {
    try {
      await setDoc(doc(db, collectionName, id), data, {
        merge: true,
      });
    } catch (e: unknown) {
      console.error("Ошибка при сохранении:", e);
    }
  },

  delete: async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (e: unknown) {
      console.error("Ошибка при удалении:", e);
    }
  },
};
