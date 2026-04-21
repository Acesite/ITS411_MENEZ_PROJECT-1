// mapscreen/constants.ts
import type { ReportCategory, ReportPriority } from "./types";

// ── Category emoji map ────────────────────────────────────────────────────────
export const CATEGORY_EMOJI: Record<ReportCategory, string> = {
  "Damaged Road": "🛣️",
  "Flood & Drainage": "🌊",
  "Broken Drainage / Canal": "🚰",
  "Fire Hazard": "🔥",
  "Broken Street Light": "💡",
  "Illegal Dumping": "🗑️",
  "Illegal Road Obstruction": "🚧",
  "Illegal Structure / Encroachment": "🏚️",
  "Overgrown Vegetation": "🌿",
  "Water Supply Issue": "💧",
};

// ── Department map ────────────────────────────────────────────────────────────
export const CATEGORY_DEPT: Record<ReportCategory, string> = {
  "Damaged Road": "Dept. of Public Works & Highways",
  "Flood & Drainage": "Bacolod City Drainage Division",
  "Broken Drainage / Canal": "Bacolod City Drainage Division",
  "Fire Hazard": "Bureau of Fire Protection",
  "Broken Street Light": "Bacolod City Engineering Office",
  "Illegal Dumping": "City Environment & Natural Resources Office",
  "Illegal Road Obstruction": "City Traffic Authority Office",
  "Illegal Structure / Encroachment": "City Planning & Development Office",
  "Overgrown Vegetation": "City Environment & Natural Resources Office",
  "Water Supply Issue": "Bacolod City Water District",
};

// ── Category groups (for filter chips) ───────────────────────────────────────
export type CategoryGroup = {
  group: string;
  emoji: string;
  items: ReportCategory[];
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    group: "Infrastructure",
    emoji: "🏗️",
    items: [
      "Damaged Road",
      "Broken Street Light",
      "Broken Drainage / Canal",
      "Water Supply Issue",
    ],
  },
  {
    group: "Hazards",
    emoji: "⚠️",
    items: ["Flood & Drainage", "Fire Hazard"],
  },
  {
    group: "Public Order",
    emoji: "🚨",
    items: [
      "Illegal Road Obstruction",
      "Illegal Structure / Encroachment",
      "Illegal Dumping",
    ],
  },
  {
    group: "Environment",
    emoji: "🌿",
    items: ["Overgrown Vegetation"],
  },
];

export const GROUP_COLOR: Record<string, string> = {
  Infrastructure: "#1A6BF5",
  Hazards: "#F97316",
  "Public Order": "#DC2626",
  Environment: "#16A34A",
};

// ── All categories flat list ──────────────────────────────────────────────────
export const REPORT_CATEGORIES: ReportCategory[] = CATEGORY_GROUPS.flatMap(
  (g) => g.items,
);

// ── Filter ────────────────────────────────────────────────────────────────────
export const FILTER_ALL = "ALL" as const;
export type FilterOption =
  | typeof FILTER_ALL
  | "Infrastructure"
  | "Hazards"
  | "Public Order"
  | "Environment";

// ── Map defaults ──────────────────────────────────────────────────────────────
export const DEFAULT_CENTER: [number, number] = [122.9487, 10.6769]; // Bacolod City

// ── Priority ──────────────────────────────────────────────────────────────────
export const PRIORITY_LEVELS: ReportPriority[] = ["Low", "Medium", "High"];

export const PRIORITY_CONFIG: Record<
  ReportPriority,
  { emoji: string; color: string; bg: string }
> = {
  Low: { emoji: "🟢", color: "#16A34A", bg: "#F0FDF4" },
  Medium: { emoji: "🟡", color: "#CA8A04", bg: "#FEFCE8" },
  High: { emoji: "🔴", color: "#DC2626", bg: "#FEF2F2" },
};
