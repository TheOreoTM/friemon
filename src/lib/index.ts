// Main exports for the Friemon game library

// Characters and Components
export { Character } from './character/Character';
export { Technique } from './character/Technique';
export { createTrait } from './character/Trait';

// Battle System
export { Battle } from './battle/Battle';

// Type Definitions
export * from './types/enums';
export * from './types/interfaces';
export * from './types/types';

// Data
export { AFFINITY_CHART, RACE_AFFINITY_BONUS, getAffinityAdvantage, getAdvantageText } from './data/AffinityChart';
export { TECHNIQUES } from './data/Techniques';
export { TRAITS } from './data/Traits';
export { DISPOSITIONS } from './data/Dispositions';
export { EQUIPMENT } from './data/Equipment';

// Utilities

// Client
export { FriemonClient } from './FriemonClient';
