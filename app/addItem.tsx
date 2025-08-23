import { useRouter } from "expo-router"; // <-- import router
import { signOut } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebase/firebaseConfig";

interface Item {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export default function AddItem() {
  const router = useRouter(); // <-- initialize router

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [list, setList] = useState<Item[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const itemsCollection = collection(db, "items");

  const fetchItems = async () => {
    const snapshot = await getDocs(itemsCollection);
    const items: Item[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Item));
    setList(items);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // <-- Updated logout function with navigation
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Success", "Logged out successfully!");
      router.push("/login"); // <-- redirect to login page
    } catch (error) {
      Alert.alert("Error", "Failed to log out.");
    }
  };

  const handleAddItem = async () => {
    if (!name || !description) {
      Alert.alert("Error", "Name and description are required.");
      return;
    }

    if (editingId) {
      await updateDoc(doc(db, "items", editingId), { name, description, tags });
      setEditingId(null);
    } else {
      await addDoc(itemsCollection, { name, description, tags });
    }

    setName("");
    setDescription("");
    setTags([]);
    setTagInput("");
    fetchItems();
  };

  const handleEdit = (item: Item) => {
    setName(item.name);
    setDescription(item.description);
    setTags(item.tags);
    setEditingId(item.id);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "items", id));
    fetchItems();
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
  <View style={styles.container}>
    {/* Logout button floating at top-right */}
    <View style={styles.logoutButtonWrapper}>
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>

    <Text style={styles.title}>Add Product</Text>

    <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
    <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />

    {/* Tag input & chips */}
    <View style={styles.tagsWrapper}>
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tagChip}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
              <Text style={styles.removeTag}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TextInput
        placeholder="Add a tag"
        value={tagInput}
        onChangeText={setTagInput}
        onSubmitEditing={handleAddTag}
        style={styles.input}
      />
      <Button title="Add Tag" onPress={handleAddTag} />
    </View>

    <Button title={editingId ? "Update Item" : "Add Item"} onPress={handleAddItem} />

    <FlatList
      data={list}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <Text style={styles.itemText}>{item.name}</Text>
          <Text>{item.description}</Text>
          <Text>Tags: {item.tags.join(", ")}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={() => handleEdit(item)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  logoutButtonWrapper: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1, // ensures it's on top
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
  itemContainer: { padding: 10, borderBottomWidth: 1, borderColor: "#ccc", marginTop: 10 },
  itemText: { fontWeight: "bold", fontSize: 18 },
  buttonRow: { flexDirection: "row", marginTop: 5 },
  editButton: { color: "blue", marginRight: 10 },
  deleteButton: { color: "red" },

  tagsWrapper: { marginBottom: 10 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 5 },
  tagChip: { flexDirection: "row", backgroundColor: "#eee", borderRadius: 15, paddingHorizontal: 10, paddingVertical: 5, margin: 3, alignItems: "center" },
  tagText: { marginRight: 5 },
  removeTag: { color: "red", fontWeight: "bold" },
});
