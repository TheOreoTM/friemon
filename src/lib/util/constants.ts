import { join } from 'path';
import { setup } from '@skyra/env-utilities';
import { hours, minutes } from './time';

// Load environment variables first
export const ROOT_DIR = join(__dirname, '..', '..');
setup({ path: join(ROOT_DIR, '..', '.env') });

export const SRC_DIR = join(ROOT_DIR, 'src');
export const DATA_DIR = join(ROOT_DIR, 'data');

export const RANDOM_LOADING_MESSAGE = ['Computing...', 'Thinking...', 'Cooking some food', 'Give me a moment', 'Loading...'];

export const DEFAULT_PREFIX = '>';
export const GAME_CHANNEL_ID = process.env.GAME_CHANNEL;

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

// Battle System Constants
export const BATTLE_CONSTANTS = {
	MAX_TIMEOUTS: 3,
	TIMEOUT_DURATION: minutes(2), // 2 minutes in milliseconds
	THREAD_AUTO_ARCHIVE_DURATION: 60, // 1 hour in minutes
	BATTLE_CLEANUP_DELAY: hours(24), // 24 hours in milliseconds
	OLD_BATTLE_MAX_AGE: minutes(30), // 30 minutes in milliseconds
	CLEANUP_INTERVAL: minutes(5) // 5 minutes in milliseconds
} as const;
