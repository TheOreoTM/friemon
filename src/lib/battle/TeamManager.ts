import { Character } from '../character/Character';
import { TeamPosition, TargetType } from '../types/types';

export class TeamManager {
	private party: Character[];
	private activeIndex: number;

	constructor(party: Character[], activeIndex: number = 0) {
		this.party = party;
		this.activeIndex = activeIndex;
	}

	getPosition(position: TeamPosition): Character | null {
		const index = position - 1; // Convert 1-based to 0-based
		return this.party[index] || null;
	}

	getActiveCharacter(): Character | null {
		return this.party[this.activeIndex] || null;
	}

	getCharacterAtIndex(index: number): Character | null {
		return this.party[index] || null;
	}

	getAllCharacters(): Character[] {
		return [...this.party];
	}

	getAvailableCharacters(): Character[] {
		return this.party.filter((char) => !char.isDefeated());
	}

	getAvailableSwitches(): Character[] {
		return this.party.filter((char, index) => index !== this.activeIndex && !char.isDefeated());
	}

	switchToPosition(position: TeamPosition): boolean {
		const index = position - 1;
		return this.switchToIndex(index);
	}

	switchToIndex(newIndex: number): boolean {
		if (newIndex < 0 || newIndex >= this.party.length) {
			return false;
		}

		const character = this.party[newIndex];
		if (!character || character.isDefeated()) {
			return false;
		}

		this.activeIndex = newIndex;
		return true;
	}

	findCharacter(character: Character): number {
		return this.party.findIndex((char) => char === character);
	}

	getActiveIndex(): number {
		return this.activeIndex;
	}

	hasDefeatedCharacters(): boolean {
		return this.party.some((char) => char.isDefeated());
	}

	isTeamDefeated(): boolean {
		return this.party.every((char) => char.isDefeated());
	}

	getTargets(targetType: TargetType, opponentTeam: TeamManager, multiTargetCount: number = 2): Character[] {
		switch (targetType) {
			case 'single':
				return [opponentTeam.getActiveCharacter()].filter(Boolean) as Character[];

			case 'chooseTarget':
				// For manual target selection, return all available enemies as options
				return opponentTeam.getAvailableCharacters();

			case 'multiTarget': {
				// Auto-hits multiple targets starting with active character
				const active = opponentTeam.getActiveCharacter();
				const others = opponentTeam.getAvailableCharacters().filter((char) => char !== active);
				const possibleTargets = [active, ...others].filter(Boolean);
				const targets = possibleTargets.slice(0, multiTargetCount).filter((c) => c !== null);
				return targets as Character[];
			}

			case 'allEnemies':
				return opponentTeam.getAvailableCharacters();

			case 'self':
				return [this.getActiveCharacter()].filter(Boolean) as Character[];

			default:
				return [opponentTeam.getActiveCharacter()].filter(Boolean) as Character[];
		}
	}

	requiresTargetSelection(targetType: TargetType): boolean {
		return targetType === 'chooseTarget';
	}

	validateTarget(targetType: TargetType, targetCharacter: Character, opponentTeam: TeamManager): boolean {
		const validTargets = this.getTargets(targetType, opponentTeam);
		return validTargets.includes(targetCharacter);
	}

	autoSwitchToNext(): boolean {
		for (let i = 0; i < this.party.length; i++) {
			if (i !== this.activeIndex && !this.party[i].isDefeated()) {
				this.activeIndex = i;
				return true;
			}
		}
		return false;
	}

	getTeamStatus(): string {
		return this.party
			.map((char, index) => {
				const position = index + 1;
				const active = index === this.activeIndex ? '👑' : '';
				const status = char.isDefeated() ? '💀' : '';
				const hp = `${char.currentHP}/${char.maxHP}`;
				return `${active}${status} ${position}. ${char.name} (${hp} HP)`;
			})
			.join('\n');
	}
}
