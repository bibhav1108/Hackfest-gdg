/**
 * Handwriting-aware edit distance & confusion matrix for medical prescription handwriting errors
 * Specified in Section 4A.1 of documentation:
 * Confusable groups:
 * a / o / e, u / n / v, c / e / o, l / t / i / 1, rn / m, cl / d, h / b / k, g / q / 9, 0 / 6 / 8, 5 / 6
 */

export const CONFUSION_GROUPS: string[][] = [
  ['a', 'o', 'e'],
  ['u', 'n', 'v'],
  ['c', 'e', 'o'],
  ['l', 't', 'i', '1'],
  ['h', 'b', 'k'],
  ['g', 'q', '9'],
  ['0', '6', '8'],
  ['5', '6'],
  ['p', 'b'],
  ['f', 'ph', 'v'],
  ['s', 'c', 'z'],
  ['k', 'c', 'q']
];

// Digraph confusions common in script
export const DIGRAPH_CONFUSIONS: [string, string][] = [
  ['rn', 'm'],
  ['m', 'rn'],
  ['cl', 'd'],
  ['d', 'cl'],
  ['vv', 'w'],
  ['w', 'vv'],
  ['in', 'm'],
  ['ni', 'm']
];

export function areConfusable(charA: string, charB: string): boolean {
  if (charA === charB) return true;
  const a = charA.toLowerCase();
  const b = charB.toLowerCase();

  for (const group of CONFUSION_GROUPS) {
    if (group.includes(a) && group.includes(b)) {
      return true;
    }
  }
  return false;
}

/**
 * Calculates handwriting-weighted edit distance.
 * Lower distance means higher likelihood of matching the prescription.
 */
export function handwritingWeightedDistance(pattern: string, target: string): number {
  const p = pattern.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  // If pattern contains wildcards * or ?, handle appropriately
  const m = p.length;
  const n = t.length;

  // DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    const pChar = p[i - 1];

    for (let j = 1; j <= n; j++) {
      const tChar = t[j - 1];

      if (pChar === '?') {
        // Wildcard matches any single character at 0 cost
        dp[i][j] = dp[i - 1][j - 1];
      } else if (pChar === '*') {
        // Wildcard matches zero or more characters at 0 cost
        dp[i][j] = Math.min(
          dp[i - 1][j],     // match 0 chars
          dp[i][j - 1],     // match 1 more char
          dp[i - 1][j - 1]  // match 1 char
        );
      } else if (pChar === tChar) {
        dp[i][j] = dp[i - 1][j - 1];
      } else if (areConfusable(pChar, tChar)) {
        // Confusable pair (e.g. o vs a, or 0 vs 6) costs only 0.25
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 0.25,
          dp[i - 1][j] + 1.0,
          dp[i][j - 1] + 1.0
        );
      } else {
        // Standard substitution/insertion/deletion
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1.0,
          dp[i - 1][j] + 1.0,
          dp[i][j - 1] + 1.0
        );
      }
    }
  }

  return dp[m][n];
}
