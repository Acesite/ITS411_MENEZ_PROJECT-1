import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SuccessScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/"); 
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Registered Successfully</Text>
      <Text style={styles.subText}>You may now login</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  message: {
    fontSize: 22,
    fontWeight: "bold",
    color: "green",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "gray",
  },
});