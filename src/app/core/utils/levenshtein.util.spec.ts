import { levenshtein, matchScore } from './levenshtein.util';

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('abc', 'abc')).toBe(0);
  });
  it('returns length when one string is empty', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
  });
  it('computes single edit distance', () => {
    expect(levenshtein('abc', 'abd')).toBe(1);
    expect(levenshtein('abc', 'aXbc')).toBe(1);
  });
});

describe('matchScore (4-level matching)', () => {
  it('returns 0 when needle is empty', () => {
    expect(matchScore('SOC', '')).toBe(0);
  });
  it('returns 4 for an exact match (case-insensitive)', () => {
    expect(matchScore('SOC', 'soc')).toBe(4);
  });
  it('returns 3 for a one-char difference', () => {
    expect(matchScore('soc', 'sac')).toBe(3);
  });
  it('returns 2 when haystack starts with needle', () => {
    expect(matchScore('soc platform', 'soc p')).toBe(2);
  });
  it('returns 1 when haystack contains needle', () => {
    expect(matchScore('platform soc essential', 'essential')).toBe(1);
  });
  it('returns 0 when there is no match', () => {
    expect(matchScore('edr', 'zzzz')).toBe(0);
  });
});
