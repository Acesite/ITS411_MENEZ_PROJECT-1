import { Link } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useUser } from "../provider/userProvider";

export default function Details() {
  const { user, clearUser } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details</Text>

      {user ? (
        <>
          <Text style={styles.info}>Same user here: {user.name}</Text>
          <Button title="Clear User" onPress={clearUser} />
        </>
      ) : (
        <Text style={styles.info}>No user yet. Go back and set one.</Text>
      )}

      <View style={{ height: 16 }} />
      <Link href="/">← Back to Home</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  info: { fontSize: 18, marginBottom: 12, textAlign: "center" },
});
