/**
 * Nickname Validation Utility
 * Handles all client-side validation rules for nicknames
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Validation rules constants
const NICKNAME_RULES = {
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9_]+$/, // Alphanumeric + underscore only
  notStartWithUnderscore: /^[^_]/, // Must not start with underscore
  notEndWithUnderscore: /[^_]$/, // Must not end with underscore
};

/**
 * Validates nickname format
 * @param nickname - The nickname to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateNicknameFormat(nickname: string): ValidationResult {
  // Check if empty or whitespace
  if (!nickname || nickname.trim().length === 0) {
    return {
      valid: false,
      error: "Nickname cannot be empty",
    };
  }

  // Check minimum length
  if (nickname.length < NICKNAME_RULES.minLength) {
    return {
      valid: false,
      error: `Nickname must be at least ${NICKNAME_RULES.minLength} characters`,
    };
  }

  // Check maximum length
  if (nickname.length > NICKNAME_RULES.maxLength) {
    return {
      valid: false,
      error: `Nickname must not exceed ${NICKNAME_RULES.maxLength} characters`,
    };
  }

  // Check pattern (alphanumeric + underscore only)
  if (!NICKNAME_RULES.pattern.test(nickname)) {
    return {
      valid: false,
      error: "Only letters, numbers, and underscores are allowed",
    };
  }

  // Check doesn't start with underscore
  if (!NICKNAME_RULES.notStartWithUnderscore.test(nickname)) {
    return {
      valid: false,
      error: "Nickname cannot start with an underscore",
    };
  }

  // Check doesn't end with underscore
  if (!NICKNAME_RULES.notEndWithUnderscore.test(nickname)) {
    return {
      valid: false,
      error: "Nickname cannot end with an underscore",
    };
  }

  return {
    valid: true,
  };
}

/**
 * Gets remaining character count for nickname
 * @param nickname - Current nickname input
 * @returns Object with current length and max length
 */
export function getCharacterCount(nickname: string): {
  current: number;
  max: number;
  remaining: number;
} {
  const current = nickname.length;
  const max = NICKNAME_RULES.maxLength;
  const remaining = max - current;

  return {
    current,
    max,
    remaining,
  };
}

/**
 * Gets validation rules as human-readable text
 * @returns Array of rule descriptions
 */
export function getValidationRules(): string[] {
  return [
    `${NICKNAME_RULES.minLength}-${NICKNAME_RULES.maxLength} characters`,
    "Letters, numbers, and underscores only",
    "Cannot start or end with underscore",
  ];
}
