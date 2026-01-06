import { describe, it, expect } from 'vitest';
import { validateUUID, assertUUID, validateAmount, validateISODate } from './validation';

describe('validateUUID', () => {
  it('should accept valid UUIDs', () => {
    expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(validateUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
  });

  it('should reject invalid UUIDs', () => {
    expect(validateUUID('not-a-uuid')).toBe(false);
    expect(validateUUID('')).toBe(false);
    expect(validateUUID('123')).toBe(false);
    expect(validateUUID('550e8400-e29b-41d4-a716')).toBe(false); // Incomplete
  });

  it('should reject null and undefined', () => {
    expect(validateUUID(null as any)).toBe(false);
    expect(validateUUID(undefined as any)).toBe(false);
  });
});

describe('assertUUID', () => {
  it('should not throw for valid UUIDs', () => {
    expect(() => assertUUID('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
    expect(() => assertUUID('123e4567-e89b-12d3-a456-426614174000', 'testField')).not.toThrow();
  });

  it('should throw for invalid UUIDs', () => {
    expect(() => assertUUID('not-a-uuid')).toThrow();
    expect(() => assertUUID('', 'fieldName')).toThrow(/fieldName/);
    expect(() => assertUUID('123')).toThrow();
  });
});

describe('validateAmount', () => {
  it('should accept positive numbers', () => {
    expect(validateAmount(100)).toBe(true);
    expect(validateAmount(0.01)).toBe(true);
    expect(validateAmount(1000000.50)).toBe(true);
  });

  it('should reject negative numbers and zero', () => {
    expect(validateAmount(-10)).toBe(false);
    expect(validateAmount(0)).toBe(false);
    expect(validateAmount(-0.01)).toBe(false);
  });

  it('should reject NaN and invalid types', () => {
    expect(validateAmount(NaN)).toBe(false);
    expect(validateAmount(Infinity)).toBe(false);
    expect(validateAmount(-Infinity)).toBe(false);
    expect(validateAmount('100' as any)).toBe(false);
  });
});

describe('validateISODate', () => {
  it('should accept valid ISO dates', () => {
    expect(validateISODate('2024-01-15')).toBe(true);
    expect(validateISODate('2024-12-31')).toBe(true);
    expect(validateISODate('2024-06-30')).toBe(true);
  });

  it('should reject invalid dates', () => {
    expect(validateISODate('2024-13-01')).toBe(false); // Invalid month
    expect(validateISODate('2024-02-30')).toBe(false); // Invalid day
    expect(validateISODate('not-a-date')).toBe(false);
    expect(validateISODate('2024/01/15')).toBe(false); // Wrong format
    expect(validateISODate('15-01-2024')).toBe(false); // Wrong order
  });

  it('should reject invalid formats', () => {
    expect(validateISODate('')).toBe(false);
    expect(validateISODate('2024-1-1')).toBe(false); // Missing leading zeros
    expect(validateISODate('24-01-15')).toBe(false); // Year too short
  });
});
