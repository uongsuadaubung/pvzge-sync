import { IGNORED_KEYS } from './constants';
import type { SaveData, Conflict } from './types';

export function isPvzDate(obj: unknown): boolean {
    const o = obj as Record<string, unknown>;
    return !!(o && typeof o.year === 'number' && typeof o.month === 'number' && typeof o.date === 'number');
}

export function findConflicts(local: SaveData, remote: SaveData, path = ''): Conflict[] {
    let results: Conflict[] = [];
    const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);
    for (const key of allKeys) {
        if (IGNORED_KEYS.includes(key)) continue;
        const currentPath = path ? `${path}.${key}` : key;
        const lVal = local[key], rVal = remote[key];
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
