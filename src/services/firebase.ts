import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, setDoc, doc, deleteDoc, QuerySnapshot, DocumentData, FirestoreError } from "firebase/firestore";

// Твоя конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBVlamAzx_irw6gRPapHzt88c17-VHa-uM",
  authDomain: "shop-c5488.firebaseapp.com",
  projectId: "shop-c5488",
  storageBucket: "shop-c5488.firebasestorage.app",
  messagingSenderId: "199296594637",
  appId: "1:199296594637:web:f6b8071bd9ed245605ef84",
  measurementId: "G-1XT2HXS61B"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Универсальный объект для работы с коллекциями
export const firebaseDb = {
  subscribe: <T extends object>(collectionName: string, callback: (data: (T & { id: string })[]) => void) => {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as T) }));
        callback(data);
      },
      (error: FirestoreError) => {
        console.error(`Ошибка подписки на ${collectionName}:`, error);
      }
    );
  },

  save: async <T extends object>(collectionName: string, id: string, data: T) => {
    try {
      await setDoc(doc(db, collectionName, id), data, { merge: true });
    } catch (e) {
      console.error("Ошибка при сохранении в Firestore:", e);
    }
  },

  delete: async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (e) {
      console.error("Ошибка при удалении из Firestore:", e);
    }
  }
};
