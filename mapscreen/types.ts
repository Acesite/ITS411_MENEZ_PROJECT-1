// components/MapScreen/types.ts

export type ReportCategory =
  | "🌉 Broken Bridge"
  | "🛣️ Damaged Road"
  | "🏗️ Unfinished Infrastructure"
  | "🌊 Destroyed Creek"
  | "🗑️ Garbage Dump"
  | "💡 Broken Street Light"
  | "🚧 Road Obstruction";

export type ReportStatus = "pending" | "resolved";

export type Report = {
  id: string;
  coord: [number, number]; // [lng, lat]
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  imageBase64: string | null;
  userId: string | null;
  userName: string;
  createdAt: Date | null;
  createdAgo: string;
};

export type Comment = {
  id: string;
  text: string;
  userId: string | null;
  userName: string;
  createdAt: Date | null;
  createdAgo: string;
};

export type UserProfile = {
  displayName?: string | null;
  avatarBase64?: string | null;
};

export type ReportWithRenderCoord = Report & {
  renderCoord: [number, number];
};
