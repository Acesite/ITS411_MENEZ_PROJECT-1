// constants/theme.ts
import { Platform } from "react-native";

export const BLUE = "#1A6BF5";
export const BLUE_DARK = "#1150C4";
export const BLUE_SOFT = "#EAF0FF";
export const INK = "#0F1E3C";
export const MUTED = "#6B7FA8";
export const BORDER = "#C8D6F5";
export const WHITE = "#FFFFFF";
export const BG = "#F0F5FF";

export const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

export const GRADIENT_COLORS: [string, string, string] = [
  "#F0F5FF",
  "#E6EEFF",
  "#F0F5FF",
];
