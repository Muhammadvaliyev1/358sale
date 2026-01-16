// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  setDoc,
  doc,
  deleteDoc,
  QuerySnapshot,
  DocumentData,
  FirestoreError
} from "firebase/firestore";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBVlamAzx_irw6gRPapHzt88c17-VHa-uM",
  authDomain: "shop-c5488.firebaseapp.com",
  projectId: "shop-c5488",
  storageBucket: "shop-c5488.firebasestorage.app",
  messagingSenderId: "199296594637",
  appId: "1:199296594637:web:f6b8071bd9ed245605ef84",
  measurementId: "G-1XT2HXS61B"
};

// Инициализация приложения и Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Тип для универсальной подписки на коллекцию
type CollectionCallback<T> = (data: (T & { id: string })[]) => void;

export const firebaseDb = {
  /**
   * Подписка на коллекцию Firestore
   * @param collectionName Название коллекции
   * @param callback Функция, вызываемая при обновлении данных
   * @returns Функция для отписки
   */
  subscribe: <T extends object>(
    collectionName: string,
    callback: CollectionCallback<T>
  ): (() => void) => {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data: (T & { id: string })[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as T)
        }));
        callback(data);
      },
      (error: FirestoreError) => {
        console.error(`Ошибка подписки на коллекцию "${collectionName}":`, error);
      }
    );
    return unsubscribe;
  },

  /**
   * Сохранение или обновление документа
   * @param collectionName Название коллекции
   * @param id ID документа
   * @param data Данные документа
   */
  save: async <T extends object>(collectionName: string, id: string, data: T) => {
    try {
      await setDoc(doc(db, collectionName, id), data, { merge: true });
    } catch (error) {
      console.error(`Ошибка при сохранении документа в "${collectionName}":`, error);
    }
  },

  /**
   * Удаление документа из коллекции
   * @param collectionName Название коллекции
   * @param id ID документа
   */
  delete: async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Ошибка при удалении документа из "${collectionName}":`, error);
    }
  }
};