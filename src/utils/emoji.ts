/**
 * @fileoverview Emoji utilities for handling emoji shortcodes in posts
 * Provides mapping between shortcodes and Unicode emojis
 */

/**
 * Common emoji shortcodes mapping
 */
export const EMOJI_SHORTCODES = {
  // Greetings
  'ohayo': '🌅',
  'hello': '👋',
  'wave': '👋',
  'hi': '👋',
  
  // Expressions
  'smile': '😊',
  'laughing': '😂',
  'heart': '❤️',
  'fire': '🔥',
  'star': '⭐',
  'lightning': '⚡',
  'zap': '⚡',
  
  // Common reactions
  'thumbsup': '👍',
  'thumbsdown': '👎',
  'clap': '👏',
  'pray': '🙏',
  'rocket': '🚀',
  'eyes': '👀',
  
  // Nature
  'sun': '☀️',
  'moon': '🌙',
  'rainbow': '🌈',
} as const

/**
 * Converts an emoji shortcode to its Unicode equivalent
 */
export function shortcodeToEmoji(shortcode: string): string {
  return EMOJI_SHORTCODES[shortcode as keyof typeof EMOJI_SHORTCODES] || `:${shortcode}:`
}

/**
 * Checks if a shortcode has a known emoji mapping
 */
export function hasEmojiMapping(shortcode: string): boolean {
  return shortcode in EMOJI_SHORTCODES
}

/**
 * Converts text with shortcodes to Unicode emojis
 */
export function convertShortcodes(text: string): string {
  return text.replace(/:([a-zA-Z0-9_\-+]+):/g, (match, shortcode) => {
    return shortcodeToEmoji(shortcode)
  })
}

/**
 * Gets all available shortcodes
 */
export function getAvailableShortcodes(): string[] {
  return Object.keys(EMOJI_SHORTCODES)
} 