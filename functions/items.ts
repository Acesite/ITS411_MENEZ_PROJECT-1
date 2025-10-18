// functions/items.ts
import auth from "@react-native-firebase/auth";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
// OPTIONAL: If you want strict typing on Firebase errors, uncomment next line
// import { FirebaseError } from "@react-native-firebase/app";

export interface ItemDTO {
  id?: string;
  name: string;
  description: string;
  tags?: string[];
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt?: FirebaseFirestoreTypes.Timestamp | null;
}

function userCollection() {
  const user = auth().currentUser;
  if (!user) throw new Error("Not signed in");
  return firestore().collection("users").doc(user.uid).collection("items");
}

export const addItem = async (name: string, description: string, tags: string[] = []) => {
  return userCollection().add({
    name: String(name).trim(),
    description: String(description).trim(),
    tags,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  } as ItemDTO);
};

export const getItems = async (): Promise<ItemDTO[]> => {
  try {
    const snap = await userCollection().orderBy("createdAt", "desc").get();
    const docs = snap?.docs ?? [];
    return docs.map((d) => ({ id: d.id, ...(d.data() as ItemDTO) }));
  } catch (e: any) {
    // e is often a Firebase error with a `code`
    console.log("getItems error:", e?.code, e?.message);
    throw e;
  }
};

/** Real-time subscription with error handler to avoid null snapshot crashes */
export const subscribeItems = (
  onItems: (items: ItemDTO[]) => void,
  // Type as any (or: (err: FirebaseError) => void if you imported it)
  onError?: (err: any) => void
) => {
  try {
    const ref = userCollection().orderBy("createdAt", "desc");
    return ref.onSnapshot(
      (qs) => {
        const docs = qs?.docs ?? [];
        const items = docs.map((d) => ({ id: d.id, ...(d.data() as ItemDTO) }));
        onItems(items);
      },
      // 👇 explicitly type the error to avoid TS2339
      (err: any) => {
        console.log("onSnapshot error:", err?.code, err?.message);
        onError?.(err);
      }
    );
  } catch (e: any) {
    console.log("subscribeItems setup error:", e?.message);
    onError?.(e);
    return () => {};
  }
};

export const updateItem = async (id: string, data: Partial<ItemDTO>) => {
  return userCollection().doc(id).update({
    ...data,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

export const deleteItem = async (id: string) => {
  return userCollection().doc(id).delete();
};
