import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, QuerySnapshot, DocumentData, QueryDocumentSnapshot, FirestoreError,} from "firebase/firestore";

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