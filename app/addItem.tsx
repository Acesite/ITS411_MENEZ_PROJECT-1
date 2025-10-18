// app/addItem.tsx
import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  addItem,
  deleteItem,
  ItemDTO,
  subscribeItems,
  updateItem,
} from "../functions/items";
import { useUser } from "../provider/userProvider"; // provider hook

type Item = ItemDTO & { id: string };

export default function AddItem() {
  const router = useRouter();
  const { user, setUser, clearUser } = useUser();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [list, setList] = useState<Item[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback: hydrate provider from Firebase if session exists
  useEffect(() => {
    const sub = auth().onAuthStateChanged((fbUser) => {
      if (!user && fbUser?.email) {
        const email = fbUser.email.toLowerCase();
        setUser({ name: email.split("@")[0], email });
      }
    });
    return sub;
  }, [user, setUser]);

  // Subscribe to items once auth is ready
  useEffect(() => {
    const unsubAuth = auth().onAuthStateChanged((fbUser) => {
      if (!fbUser) {
        setList([]);
        setLoading(false);
        return;
      }

      const unsubItems = subscribeItems(
        (items: ItemDTO[]) => {
          setList(items as Item[]);
          setLoading(false);
        },
        (err) => {
          setLoading(false);
          Alert.alert("Failed to fetch items", err?.message ?? "Unknown error");
        }
      );

      return () => {
        if (typeof unsubItems === "function") unsubItems();
      };
    });

    return () => {
      if (typeof unsubAuth === "function") unsubAuth();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
    } finally {
      clearUser();
      router.replace("/");
    }
  };

  const handleAddItem = async () => {
    if (!name || !description) {
      Alert.alert("Error", "Name and description are required.");
      return;
    }
    try {
      if (editingId) {
        await updateItem(editingId, { name, description, tags });
        setEditingId(null);
      } else {
        await addItem(name, description, tags);
      }
      setName("");
      setDescription("");
      setTags([]);
      setTagInput("");
    } catch (e: any) {
      console.log("Save item error:", e?.code, e?.message);
      Alert.alert("Error", "Failed to save item.");
    }
  };

  const handleEdit = (item: Item) => {
    setName(item.name);
    setDescription(item.description);
    setTags(item.tags || []);
    setEditingId(item.id);
  };

  const handleDeletePress = async (id: string) => {
    try {
      await deleteItem(id);
    } catch (e: any) {
      console.log("Delete item error:", e?.code, e?.message);
      Alert.alert("Error", "Failed to delete item.");
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags((t) => [...t, newTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((t) => t.filter((tag) => tag !== tagToRemove));
  };

  // ---------- UI: Display name polishing ----------
  const displayName = user?.name ?? "Guest";
  const emailText = user?.email ?? "";
  const initials = useMemo(() => {
    const n = (displayName || "").trim();
    if (!n) return "?";
    const parts = n.split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase() || first.toUpperCase() || "?";
  }, [displayName]);
  // -----------------------------------------------

  return (
    <View style={styles.container}>
      {/* Header Card with Avatar + Name + Email + Logout */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.headerTextWrap}>
          <Text style={styles.nameText} numberOfLines={1}>
            {displayName}
          </Text>
          {!!emailText && (
            <Text style={styles.emailText} numberOfLines={1}>
              {emailText}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutPill} accessibilityLabel="Logout">
          <Text style={styles.logoutPillText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{editingId ? "Edit Product" : "Add Product"}</Text>

      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      {/* Tags */}
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

      {loading ? (
        <Text style={{ marginTop: 16, textAlign: "center" }}>Loading…</Text>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text>{item.description}</Text>
              <Text>Tags: {(item.tags || []).join(", ")}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={() => handleEdit(item)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePress(item.id)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: "center" }}>No items yet.</Text>}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const CARD_BG = "#ffffff";
const BORDER = "#e8e8e8";
const MUTED = "#6b7280"; // tailwind gray-500-ish
const PRIMARY = "#111827"; // near black

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f7f7f9" },

  // Header card
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb", // gray-200
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: PRIMARY },
  headerTextWrap: { flex: 1, minWidth: 0 },
  nameText: { fontSize: 16, fontWeight: "700", color: PRIMARY },
  emailText: { fontSize: 12, color: MUTED, marginTop: 2 },

  logoutPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fafafa",
  },
  logoutPillText: { fontSize: 12, fontWeight: "700", color: "#ef4444" },

  title: { fontSize: 20, fontWeight: "700", marginVertical: 12, textAlign: "center", color: PRIMARY },

  input: {
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  tagsWrapper: { marginBottom: 10 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 5 },
  tagChip: {
    flexDirection: "row",
    backgroundColor: "#eef2ff", // indigo-50-ish
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 3,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e7ff", // indigo-100-ish
  },
  tagText: { marginRight: 6, color: "#3730a3", fontWeight: "600" }, // indigo-800
  removeTag: { color: "#ef4444", fontWeight: "800" },

  itemContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  itemText: { fontWeight: "700", fontSize: 16, marginBottom: 4, color: PRIMARY },
  buttonRow: { flexDirection: "row", marginTop: 6, justifyContent: "flex-end" },
  editButton: { color: "#2563eb", marginRight: 16, fontWeight: "700" }, // blue-600
  deleteButton: { color: "#ef4444", fontWeight: "700" }, // red-500
});
