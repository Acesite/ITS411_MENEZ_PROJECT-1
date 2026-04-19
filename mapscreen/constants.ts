// components/MapScreen/constants.ts
import { ReportCategory } from "./types";

export const DEFAULT_CENTER: [number, number] = [123.8854, 10.3157];
export const AVATAR_SIZE = 40;
export const AVATAR_SIZE_BIG = 72;

export const REPORT_CATEGORIES: ReportCategory[] = [
  "🌉 Broken Bridge",
  "🛣️ Damaged Road",
  "🏗️ Unfinished Infrastructure",
  "🌊 Destroyed Creek",
  "🗑️ Garbage Dump",
  "💡 Broken Street Light",
  "🚧 Road Obstruction",
];

// Maps each category to its emoji for map markers
export const CATEGORY_EMOJI: Record<ReportCategory, string> = {
  "🌉 Broken Bridge": "🌉",
  "🛣️ Damaged Road": "🛣️",
  "🏗️ Unfinished Infrastructure": "🏗️",
  "🌊 Destroyed Creek": "🌊",
  "🗑️ Garbage Dump": "🗑️",
  "💡 Broken Street Light": "💡",
  "🚧 Road Obstruction": "🚧",
};

// Status badge colors
export const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B",
  resolved: "#10B981",
};
