import { BattleSession } from './BattleManager';

export enum MessageTarget {
	BattleLog = 'battle_log',
	Player1Thread = 'player1_thread', 
	Player2Thread = 'player2_thread',
	All = 'all'
}

export interface BattleMessage {
	content: string;
	target: MessageTarget;
	emphasis?: 'normal' | 'bold' | 'italic' | 'code';
}

export class BattleMessageCache {
	private messages: BattleMessage[] = [];

	constructor(_session: BattleSession) {
		// Session may be used for future features
	}

	/**
	 * Add a message to the cache
	 */
	push(content: string, target: MessageTarget = MessageTarget.BattleLog, emphasis: 'normal' | 'bold' | 'italic' | 'code' = 'normal'): void {
		this.messages.push({
			content: this.formatMessage(content, emphasis),
			target,
			emphasis
		});
	}

	/**
	 * Add a stat change message with proper formatting
	 */
	pushStatChange(characterName: string, stat: string, change: number, newValue: number, target: MessageTarget = MessageTarget.BattleLog): void {
		const emoji = this.getStatEmoji(stat);
		const changeText = change > 0 ? `**gained** **${change}**` : `*lost* *${Math.abs(change)}*`;
		
		this.push(
			`${characterName} ${changeText} ${emoji} ${stat}! ${characterName}'s new ${stat}: **${newValue}**`,
			target
		);
	}

	/**
	 * Add a technique use message
	 */
	pushTechniqueUse(attackerName: string, techniqueName: string, targetName?: string, target: MessageTarget = MessageTarget.BattleLog): void {
		if (targetName) {
			this.push(`${attackerName} uses **${techniqueName}** on ${targetName}!`, target);
		} else {
			this.push(`${attackerName} uses **${techniqueName}**!`, target);
		}
	}

	/**
	 * Add a damage message
	 */
	pushDamage(_attackerName: string, targetName: string, damage: number, remainingHP: number, target: MessageTarget = MessageTarget.BattleLog): void {
		if (damage > 0) {
			this.push(`${targetName} takes **${damage}** damage! ${targetName} has **${remainingHP}** HP left!`, target);
		} else {
			this.push(`${targetName} takes no damage!`, target);
		}
	}

	/**
	 * Add a healing message
	 */
	pushHealing(targetName: string, healing: number, newHP: number, target: MessageTarget = MessageTarget.BattleLog): void {
		this.push(`${targetName} recovers **${healing}** HP! ${targetName} now has **${newHP}** HP!`, target);
	}

	/**
	 * Add a mana change message
	 */
	pushManaChange(characterName: string, change: number, newMana: number, target: MessageTarget = MessageTarget.BattleLog): void {
		if (change > 0) {
			this.push(`${characterName} recovers **${change}** MP! ${characterName} now has **${newMana}** MP!`, target);
		} else {
			this.push(`${characterName} uses **${Math.abs(change)}** MP! ${characterName} has **${newMana}** MP left!`, target);
		}
	}

	/**
	 * Add a status effect message
	 */
	pushStatusEffect(characterName: string, effect: string, applied: boolean, target: MessageTarget = MessageTarget.BattleLog): void {
		if (applied) {
			this.push(`${characterName} is now **${effect}**!`, target);
		} else {
			this.push(`${characterName} is no longer **${effect}**!`, target);
		}
	}

	/**
	 * Add a passive ability trigger message
	 */
	pushPassiveTrigger(characterName: string, abilityName: string, description: string, target: MessageTarget = MessageTarget.BattleLog): void {
		this.push(`✨ **${characterName}'s ${abilityName}**: ${description}`, target);
	}

	/**
	 * Get all messages and clear the cache
	 */
	flush(): BattleMessage[] {
		const messages = [...this.messages];
		this.messages = [];
		return messages;
	}

	/**
	 * Get messages for a specific target
	 */
	getMessagesForTarget(target: MessageTarget): BattleMessage[] {
		return this.messages.filter(msg => msg.target === target || msg.target === MessageTarget.All);
	}

	/**
	 * Clear the cache without returning messages
	 */
	clear(): void {
		this.messages = [];
	}

	private formatMessage(content: string, emphasis: 'normal' | 'bold' | 'italic' | 'code'): string {
		switch (emphasis) {
			case 'bold':
				return `**${content}**`;
			case 'italic':
				return `*${content}*`;
			case 'code':
				return `\`${content}\``;
			default:
				return content;
		}
	}

	private getStatEmoji(stat: string): string {
		const emojiMap: { [key: string]: string } = {
			'HP': '❤️',
			'MP': '💙',
			'Mana': '💙',
			'Attack': '⚔️',
			'Defense': '🛡️',
			'Magic Attack': '🔮',
			'Magic Defense': '✨',
			'Speed': '💨'
		};
		return emojiMap[stat] || '📊';
	}
}