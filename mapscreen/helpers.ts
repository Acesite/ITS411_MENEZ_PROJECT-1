// components/MapScreen/helpers.ts
import { Report, ReportWithRenderCoord } from "./types";

// ---------- Time formatting ----------
export const formatTimeAgo = (date: Date | null): string => {
  if (!date) return "just now";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.max(Math.floor(diffMs / 1000), 0);

  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return diffMin === 1 ? "1 min ago" : `${diffMin} mins ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr === 1 ? "1 hr ago" : `${diffHr} hrs ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4)
    return diffWeek === 1 ? "1 week ago" : `${diffWeek} weeks ago`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12)
    return diffMonth === 1 ? "1 month ago" : `${diffMonth} months ago`;

  const diffYear = Math.floor(diffDay / 365);
  return diffYear === 1 ? "1 year ago" : `${diffYear} years ago`;
};

// ---------- Image helpers ----------
function guessMimeFromBase64(b64: string): string {
  if (b64.startsWith("/9j/")) return "image/jpeg";
  if (b64.startsWith("iVBOR")) return "image/png";
  if (b64.startsWith("R0lG")) return "image/gif";
  return "image/jpeg";
}

export function toImageSource(raw?: string | null): { uri: string } | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("data:image/")) return { uri: trimmed };
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("file:")
  )
    return { uri: trimmed };

  try {
    const mime = guessMimeFromBase64(trimmed);
    return { uri: `data:${mime};base64,${trimmed}` };
  } catch (error) {
    console.log("Error creating image source:", error);
    return null;
  }
}

// ---------- Jitter overlapping pins ----------
export function jitterReportsForRender(
  reports: Report[],
): ReportWithRenderCoord[] {
  const groups: Record<string, Report[]> = {};

  reports.forEach((r) => {
    const key = `${r.coord[0].toFixed(5)}|${r.coord[1].toFixed(5)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  const result: ReportWithRenderCoord[] = [];

  Object.values(groups).forEach((group) => {
    const n = group.length;

    if (n === 1) {
      result.push({ ...group[0], renderCoord: group[0].coord });
      return;
    }

    const [baseLng, baseLat] = group[0].coord;
    const radiusMeters = 2;
    const metersPerDegLat = 111_320;
    const metersPerDegLng = 111_320 * Math.cos((baseLat * Math.PI) / 180);

    group.forEach((r, index) => {
      const angle = (2 * Math.PI * index) / n;
      const deltaLat = (Math.sin(angle) * radiusMeters) / metersPerDegLat;
      const deltaLng = (Math.cos(angle) * radiusMeters) / metersPerDegLng;

      result.push({
        ...r,
        renderCoord: [baseLng + deltaLng, baseLat + deltaLat],
      });
    });
  });

  return result;
}
