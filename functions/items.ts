// item.ts
import firestore from '@react-native-firebase/firestore';

const itemsCollection = firestore().collection('items');

// Add a new item
export const addItem = async (name: string, description: string) => {
  return itemsCollection.add({
    name,
    description,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
};

// Get all items (once)
export const getItems = async () => {
  const snapshot = await itemsCollection.get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Listen to items in real-time
export const subscribeItems = (callback: (items: any[]) => void) => {
  return itemsCollection.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(items);
  });
};

// Update an item
export const updateItem = async (id: string, data: any) => {
  return itemsCollection.doc(id).update(data);
};

// Delete an item
export const deleteItem = async (id: string) => {
  return itemsCollection.doc(id).delete();
};
