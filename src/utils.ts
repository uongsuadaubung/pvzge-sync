import { IGNORED_KEYS } from './constants';
import type { SaveData } from './types';

export function hasConflicts(local: SaveData, remote: SaveData): boolean {
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  for (const key of allKeys) {
    if (IGNORED_KEYS.includes(key)) continue;
    const lVal = local[key];
    const rVal = remote[key];
    if (JSON.stringify(lVal) !== JSON.stringify(rVal)) return true;
  }
  return false;
}
