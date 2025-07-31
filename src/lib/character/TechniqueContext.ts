import { Character } from './Character';
import { BattleSession } from '../battle/BattleManager';
import { BattleMessageCache } from '../battle/BattleMessageCache';

export interface TechniqueContext {
	/** The character using the technique */
	user: Character;
	/** The target character (for offensive techniques) */
	target?: Character;
	/** The battle session for accessing player info and interface */
	session: BattleSession;
	/** Message cache for adding battle messages */
	messageCache: BattleMessageCache;
	/** Whether the user is player 1 */
	isPlayer1User: boolean;
	/** All user's team characters */
	userTeam: Character[];
	/** All opponent's team characters */
	opponentTeam: Character[];
}