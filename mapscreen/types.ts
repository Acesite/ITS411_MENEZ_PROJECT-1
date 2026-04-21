// mapscreen/types.ts

export type ReportCategory =
  | "Damaged Road"
  | "Flood & Drainage"
  | "Broken Drainage / Canal"
  | "Fire Hazard"
  | "Broken Street Light"
  | "Illegal Dumping"
  | "Illegal Road Obstruction"
  | "Illegal Structure / Encroachment"
  | "Overgrown Vegetation"
  | "Water Supply Issue";

export type ReportPriority = "Low" | "Medium" | "High";

export type ReportStatus = "pending" | "resolved";

export type Report = {
  id: string;
  coord: [number, number]; // [lng, lat]
  description: string;
  category: ReportCategory;
  priority: ReportPriority;
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
