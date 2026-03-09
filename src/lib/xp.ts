/**
 * XP and Leveling Constants & Helpers
 */

export const XP_PER_LEVEL_BASE = 100;

/**
 * Calculates the level based on total XP.
 * Formula: Level = floor(sqrt(XP / 100)) + 1
 */
export const calculateLevel = (xp: number = 0): number => {
  return Math.floor(Math.sqrt(xp / XP_PER_LEVEL_BASE)) + 1;
};

/**
 * Calculates the total XP required to reach a specific level.
 * Formula: XP = (Level - 1)^2 * 100
 */
export const xpForLevel = (level: number): number => {
  return Math.pow(level - 1, 2) * XP_PER_LEVEL_BASE;
};

/**
 * Calculates progress within the current level.
 * Returns current XP in level, XP needed for next level, and percentage.
 */
export const getLevelProgress = (totalXp: number = 0) => {
  const currentLevel = calculateLevel(totalXp);
  const xpAtCurrentLevelStart = xpForLevel(currentLevel);
  const xpAtNextLevelStart = xpForLevel(currentLevel + 1);
  
  const xpInCurrentLevel = totalXp - xpAtCurrentLevelStart;
  const xpRequiredForNextLevel = xpAtNextLevelStart - xpAtCurrentLevelStart;
  
  // Calculate percentage, handling the case where xpRequiredForNextLevel is 0 (shouldn't happen with this formula but good for safety)
  let progressPercentage = 0;
  if (xpRequiredForNextLevel > 0) {
      progressPercentage = (xpInCurrentLevel / xpRequiredForNextLevel) * 100;
  }

  return {
    currentLevel,
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
    totalXpToNextLevel: xpAtNextLevelStart
  };
};
