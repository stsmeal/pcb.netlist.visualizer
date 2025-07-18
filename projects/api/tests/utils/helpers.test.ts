import { GetRegExp } from '../../src/utils/helpers';

describe('Helper Functions', () => {
  describe('GetRegExp', () => {
    it('should create a case-insensitive RegExp from valid string', () => {
      const result = GetRegExp('test');

      expect(result).toBeInstanceOf(RegExp);
      expect(result.source).toBe('test');
      expect(result.flags).toBe('i');
    });

    it('should handle special regex characters', () => {
      const result = GetRegExp('test.*pattern');

      expect(result).toBeInstanceOf(RegExp);
      expect(result.source).toBe('test.*pattern');
      expect(result.flags).toBe('i');
    });

    it('should return empty RegExp for invalid regex pattern', () => {
      const result = GetRegExp('[invalid');

      expect(result).toBeInstanceOf(RegExp);
      expect(result.source).toBe('(?:)');
    });

    it('should handle empty string', () => {
      const result = GetRegExp('');

      expect(result).toBeInstanceOf(RegExp);
      expect(result.source).toBe('(?:)');
      expect(result.flags).toBe('i');
    });

    it('should match strings case-insensitively', () => {
      const result = GetRegExp('Test');

      expect(result.test('test')).toBe(true);
      expect(result.test('TEST')).toBe(true);
      expect(result.test('TeSt')).toBe(true);
      expect(result.test('other')).toBe(false);
    });
  });
});
