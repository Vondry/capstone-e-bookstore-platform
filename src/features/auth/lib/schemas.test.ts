import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './schemas';

function firstError(
  result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } },
  field: string
) {
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message;
}

describe('loginSchema', () => {
  it('accepts a valid e-mail and password and trims the e-mail', () => {
    const result = loginSchema.safeParse({ email: '  reader@bookworm.test ', password: 'x' });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('reader@bookworm.test');
  });

  it('requires both fields', () => {
    const result = loginSchema.safeParse({ email: '', password: '' });
    expect(firstError(result, 'email')).toBe('Enter your e-mail address');
    expect(firstError(result, 'password')).toBe('Enter your password');
  });

  it('rejects a malformed e-mail', () => {
    const result = loginSchema.safeParse({ email: 'reader@', password: 'x' });
    expect(firstError(result, 'email')).toMatch(/valid e-mail/);
  });
});

describe('registerSchema', () => {
  const valid = {
    firstName: 'Asha',
    lastName: 'Rao',
    email: 'asha@example.com',
    password: '12345678',
  };

  it('accepts a valid account', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a password of at least 8 characters', () => {
    const result = registerSchema.safeParse({ ...valid, password: '1234567' });
    expect(firstError(result, 'password')).toBe('Use at least 8 characters');
  });

  it('rejects passwords longer than 72 characters', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'x'.repeat(73) });
    expect(firstError(result, 'password')).toBe('Use at most 72 characters');
  });

  it('requires names (whitespace only does not count) and trims them', () => {
    const result = registerSchema.safeParse({ ...valid, firstName: '   ', lastName: '' });
    expect(firstError(result, 'firstName')).toBe('Enter your first name');
    expect(firstError(result, 'lastName')).toBe('Enter your last name');
    expect(registerSchema.parse({ ...valid, firstName: ' Asha ' }).firstName).toBe('Asha');
  });

  it('limits names to 50 characters', () => {
    const result = registerSchema.safeParse({ ...valid, lastName: 'x'.repeat(51) });
    expect(firstError(result, 'lastName')).toBe('Use at most 50 characters');
  });

  it('validates the e-mail', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'nope' });
    expect(firstError(result, 'email')).toMatch(/valid e-mail/);
  });
});
