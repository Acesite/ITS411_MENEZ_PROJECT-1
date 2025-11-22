// app/_layout.tsx
import { useColorScheme } from "@/hooks/useColorScheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { UserProvider } from "../provider/userProvider";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <UserProvider>
        <Stack>
          {/* Login */}
          <Stack.Screen
            name="index"
            options={{ headerShown: false }}
          />
          {/* Signup */}
          <Stack.Screen
            name="signup"
            options={{ headerShown: false }}
          />
          {/* Map / GeoThoughts */}
          <Stack.Screen
            name="mapbox"
            options={{ headerShown: false }}
          />
          {/* Any other screens you still use */}
          <Stack.Screen
            name="success"
            options={{ headerShown: false }}
          />
        </Stack>
        <StatusBar style="auto" />
      </UserProvider>
    </ThemeProvider>
  );
}
