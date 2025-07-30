import { join } from 'path';

export const ROOT_DIR = join(__dirname, '..', '..');
export const SRC_DIR = join(ROOT_DIR, 'src');
export const DATA_DIR = join(ROOT_DIR, 'data');

export const RANDOM_LOADING_MESSAGE = ['Computing...', 'Thinking...', 'Cooking some food', 'Give me a moment', 'Loading...'];

export const DEFAULT_PREFIX = '>';

// Character Level System Constants
export const LEVEL_CONSTANTS = {
    MIN_SPAWN_LEVEL: 1,
    MAX_SPAWN_LEVEL: 30,
    MAX_LEVEL: 100,
    SPAWN_MEAN: 10,
    SPAWN_STD_DEV: 6
} as const;

// Image System Constants
export const IMAGE_CONSTANTS = {
    ASSETS_PATH: join(process.cwd(), 'assets', 'characters'),
    DEFAULT_IMAGE: 'default.png',
    SUPPORTED_FORMATS: ['.png'] as const,
    RECOMMENDED_SIZE: 512
} as const;
