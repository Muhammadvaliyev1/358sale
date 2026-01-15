
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

// Ваши актуальные ключи Firebase
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

export const firebaseDb = {
  subscribe: (collectionName: string, callback: (data: any[]) => void) => {
    try {
      const q = query(collection(db, collectionName));
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        
        // Если база совсем пустая (например, только создали проект), 
        // мы можем добавить начальные данные здесь или через UI склада.
        callback(data);
      }, (error) => {
        console.error(`Ошибка подписки на ${collectionName}:`, error);
      });
    } catch (e) {
      console.error("Ошибка Firebase:", e);
      return () => {};
    }
  },

  save: async (collectionName: string, id: string, data: any) => {
    try {
      await setDoc(doc(db, collectionName, id), data, { merge: true });
    } catch (e) {
      console.error("Ошибка при сохранении в Firestore:", e);
      alert("Ошибка сохранения! Проверьте 'Rules' в консоли Firebase (должно быть allow read, write: if true)");
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
