import { IGNORED_KEYS } from './constants';
import type { Conflict } from './types';
import type { SaveData, PvzDate } from './schema';

export function isPvzDate(obj: unknown): obj is PvzDate {
    const o = obj as Record<string, unknown>;
    return !!(o && typeof o.year === 'number' && typeof o.month === 'number' && typeof o.date === 'number');
}

export function findConflicts(local: SaveData, remote: SaveData, path = ''): Conflict[] {
    let results: Conflict[] = [];
    const localRec = local as Record<string, unknown>;
    const remoteRec = remote as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(localRec), ...Object.keys(remoteRec)]);
    for (const key of allKeys) {
        if (IGNORED_KEYS.includes(key)) continue;
        const currentPath = path ? `${path}.${key}` : key;
        const lVal = localRec[key], rVal = remoteRec[key];
        if (JSON.stringify(lVal) === JSON.stringify(rVal)) continue;
        if (typeof lVal === 'object' && lVal !== null && typeof rVal === 'object' && rVal !== null) {
            if ((Array.isArray(lVal) || Array.isArray(rVal)) && path !== '') {
                results.push({ path: currentPath, local: lVal, remote: rVal, choice: 'remote' });
            } else if (isPvzDate(lVal) && isPvzDate(rVal)) {
                results.push({ path: currentPath, local: lVal, remote: rVal, choice: 'remote' });
            } else {
                results = results.concat(findConflicts(lVal as SaveData, rVal as SaveData, currentPath));
            }
        } else {
            results.push({ path: currentPath, local: lVal, remote: rVal, choice: 'remote' });
        }
    }
    return results;
}

// hasConflicts is a thin wrapper — uses same logic as findConflicts to avoid mismatches
export function hasConflicts(local: SaveData, remote: SaveData): boolean {
    return findConflicts(local, remote).length > 0;
}
