import { LEVEL_CONSTANTS } from './constants';

/**
 * Generates a random level using normal distribution
 */

/**
 * Box-Muller transform to generate normal distribution
 * @param mean - The mean of the distribution
 * @param stdDev - The standard deviation of the distribution
 * @returns A normally distributed random number
 */
function normalRandom(mean: number, stdDev: number): number {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random(); // Converting [0,1) to (0,1)
    while (u2 === 0) u2 = Math.random();
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
}

/**
 * Generates a random character level with normal distribution
 * Range: 1-30, Mean: 10, Standard Deviation: 6
 * This gives us ~68% of characters between levels 4-16
 * and ~95% between levels 1-22
 * 
 * @returns A random level between 1 and 30
 */
export function generateRandomLevel(): number {
    let level = Math.round(normalRandom(LEVEL_CONSTANTS.SPAWN_MEAN, LEVEL_CONSTANTS.SPAWN_STD_DEV));
    
    // Clamp to our desired range
    level = Math.max(LEVEL_CONSTANTS.MIN_SPAWN_LEVEL, Math.min(LEVEL_CONSTANTS.MAX_SPAWN_LEVEL, level));
    
    return level;
}

/**
 * Calculate XP required for a specific level
 * Uses the same formula as Character class
 */
export function calculateXPForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.floor((4 * Math.pow(level, 3)) / 5);
}

/**
 * Generate starting XP for a character at a specific level
 * @param level - The level to generate XP for
 * @returns The XP amount for that level
 */
export function generateStartingXP(level: number): number {
    if (level <= 1) return 0;
    return calculateXPForLevel(level);
}

/**
 * Test function to see level distribution (for debugging)
 */
export function testLevelDistribution(samples: number = 1000): { [level: number]: number } {
    const distribution: { [level: number]: number } = {};
    
    for (let i = 0; i < samples; i++) {
        const level = generateRandomLevel();
        distribution[level] = (distribution[level] || 0) + 1;
    }
    
    return distribution;
}