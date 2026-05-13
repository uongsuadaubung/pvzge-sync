import { IGNORED_KEYS } from "@/lib/constants";
import type { Conflict } from "@/lib/types";
import { DateSchema } from "@/lib/schema";
import type { SaveData, PvzDate } from "@/lib/schema";

export function isPvzDate(obj: unknown): obj is PvzDate {
  return DateSchema.safeParse(obj).success;
}

export function findConflicts(local: SaveData, remote: SaveData, path = ""): Conflict[] {
  return diffObjects(
        local as Record<string, unknown>,
        remote as Record<string, unknown>,
        path,
  );
}

function diffObjects(local: Record<string, unknown>, remote: Record<string, unknown>, path: string): Conflict[] {
  let results: Conflict[] = [];
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  for (const key of allKeys) {
    if (IGNORED_KEYS.includes(key)) continue;
    const currentPath = path ? `${path}.${key}` : key;
    const lVal = local[key], rVal = remote[key];
    if (JSON.stringify(lVal) === JSON.stringify(rVal)) continue;
    if (typeof lVal === "object" && lVal !== null && typeof rVal === "object" && rVal !== null) {
      if ((Array.isArray(lVal) || Array.isArray(rVal)) && path !== "") {
        results.push({ path: currentPath, local: lVal, remote: rVal });
      } else if (isPvzDate(lVal) && isPvzDate(rVal)) {
        results.push({ path: currentPath, local: lVal, remote: rVal });
      } else {
        results = results.concat(diffObjects(lVal as Record<string, unknown>, rVal as Record<string, unknown>, currentPath));
      }
    } else {
      results.push({ path: currentPath, local: lVal, remote: rVal });
    }
  }
  return results;
}

// hasConflicts is a thin wrapper — uses same logic as findConflicts to avoid mismatches
export function hasConflicts(local: SaveData, remote: SaveData): boolean {
  return findConflicts(local, remote).length > 0;
}
