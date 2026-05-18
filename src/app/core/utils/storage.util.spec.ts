import { readJson, removeKey, writeJson } from './storage.util';

describe('storage util', () => {
  beforeEach(() => localStorage.clear());

  it('writes and reads JSON', () => {
    writeJson('k', { a: 1 });
    expect(readJson('k', null)).toEqual({ a: 1 });
  });

  it('returns fallback when key is missing', () => {
    expect(readJson('missing', 'fallback')).toBe('fallback');
  });

  it('returns fallback on invalid JSON', () => {
    localStorage.setItem('bad', '{not json');
    expect(readJson('bad', 42)).toBe(42);
  });

  it('removes a key', () => {
    writeJson('k', 1);
    removeKey('k');
    expect(readJson('k', 'gone')).toBe('gone');
  });
});
