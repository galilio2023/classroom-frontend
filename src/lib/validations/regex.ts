/**
 * Centralized Regular Expressions for Zod Validations.
 * This ensures consistency across frontend and backend schemas.
 */

/**
 * Validates international phone numbers.
 * Supports: +1 234 567 8900, +12345678900, 0123456789, (012) 345-6789
 */
export const phoneRegex = /^\+?[\d\s-()]{7,20}$/;

/**
 * Validates 24-hour time format (HH:MM).
 * Range: 00:00 to 23:59
 */
export const time24hRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Validates hex color codes (e.g., #FFFFFF or #FFF).
 */
export const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
