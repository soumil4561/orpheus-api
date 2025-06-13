import bcrypt from 'bcryptjs'
import { BCRYPT_DEFAULT_SALT_ROUNDS } from '@/constants'

/**
 * Hashes a plaintext password using bcrypt with the specified salt rounds.
 *
 * @param password - The plaintext password to hash.
 * @param salt - Number of salt rounds to use (default: BCRYPT_DEFAULT_SALT_ROUNDS).
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPassword(
  password: string,
  salt: number = BCRYPT_DEFAULT_SALT_ROUNDS
): Promise<string> {
  return await bcrypt.hash(password, salt)
}

/**
 * Verifies whether a given plaintext password matches a hashed password.
 *
 * @param password - The plaintext password to verify.
 * @param hash - The bcrypt hash to compare against.
 * @returns A promise that resolves to true if the password matches, false otherwise.
 */
export async function verify(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Determines whether a password hash was created using fewer salt rounds than the current standard.
 *
 * @param hash - The bcrypt hash to inspect.
 * @param expectedRounds - The expected number of salt rounds (default: BCRYPT_DEFAULT_SALT_ROUNDS).
 * @returns True if the hash needs to be regenerated with more rounds, false otherwise.
 */
export function needsRehash(
  hash: string,
  expectedRounds: number = BCRYPT_DEFAULT_SALT_ROUNDS
): boolean {
  const parts = hash.split('$')
  const actualRounds = parseInt(parts[2], 10)
  return actualRounds < expectedRounds
}
