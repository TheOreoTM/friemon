import { readFile } from 'fs/promises';
import { join } from 'path';
import { type StaticCharacterData, type StaticMoveData } from '@src/game/types';
import { DATA_DIR } from '@src/lib/util/constants';

export class GameDataService {
	public characters: Map<string, StaticCharacterData> = new Map();
	public moves: Map<string, StaticMoveData> = new Map();

	public async loadData(): Promise<void> {
		try {
			const charactersPath = join(DATA_DIR, '..', 'data', 'characters.json');
			const movesPath = join(DATA_DIR, '..', 'data', 'moves.json');

			const characterData = JSON.parse(await readFile(charactersPath, 'utf-8')) as StaticCharacterData[];
			const moveData = JSON.parse(await readFile(movesPath, 'utf-8')) as StaticMoveData[];

			characterData.forEach((char) => this.characters.set(char.id, char));
			moveData.forEach((move) => this.moves.set(move.id, move));

			console.log(`Loaded ${this.characters.size} characters and ${this.moves.size} moves.`);
		} catch (error) {
			console.error('Error loading game data:', error);
			process.exit(1); // Exit if data loading fails
		}
	}

	public getCharacter(id: string): StaticCharacterData | undefined {
		return this.characters.get(id);
	}

	public getMove(id: string): StaticMoveData | undefined {
		return this.moves.get(id);
	}
}
