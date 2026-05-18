/** Distance d'édition (Levenshtein) — utilisée par le matching de recherche à 4 niveaux. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** 4 = exact · 3 = 1 caractère de diff · 2 = commence par · 1 = contient · 0 = aucun. */
export function matchScore(haystack: string, needle: string): number {
  if (!needle) return 0;
  const h = (haystack || '').toLowerCase();
  const n = needle.toLowerCase();
  if (h === n) return 4;
  if (levenshtein(h, n) === 1) return 3;
  if (h.startsWith(n)) return 2;
  if (h.includes(n)) return 1;
  return 0;
}
