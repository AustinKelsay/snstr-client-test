/**
 * Utility function for conditionally applying CSS classes
 * Combines clsx for conditional logic with proper TypeScript support
 *
 * @param inputs - Class names, objects, or arrays to combine
 * @returns Combined class name string
 */

import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
