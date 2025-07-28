import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { Battle } from './Battle';
import { Character } from '../character/Character';

export class BattleInterface {
	private battle: Battle;

	constructor(battle: Battle) {
		this.battle = battle;
	}

	public createBattleStatusEmbed(session?: any): EmbedBuilder {
		const userCharacter = this.battle.state.userCharacter;
		const opponentCharacter = this.battle.state.opponentCharacter;
		
		const currentTurn = session ? session.currentTurn : this.battle.state.turn;
		const embed = new EmbedBuilder()
			.setTitle('⚔️ Player vs Player Battle')
			.setColor(this.battle.isComplete() ? 0xe74c3c : 0xf39c12)
			.setDescription(this.battle.isComplete() ? '🏆 **Battle Complete!**' : `⚡ **Turn ${currentTurn} - Both players choose actions**`);

		// Battle info
		if (!this.battle.isComplete() && session) {
			const player1HasActed = session.playerActions.get(session.player1Id) || false;
			const player2HasActed = session.playerActions.get(session.player2Id) || false;
			
			let statusText = '';
			if (player1HasActed && player2HasActed) {
				statusText = '✅ Both players have selected actions - processing turn...';
			} else if (player1HasActed) {
				statusText = '⏳ Player 1 ready - waiting for Player 2...';
			} else if (player2HasActed) {
				statusText = '⏳ Player 2 ready - waiting for Player 1...';
			} else {
				statusText = '⏱️ Waiting for both players to select their actions...';
			}
			
			embed.addFields({
				name: '🎯 Battle Status',
				value: statusText,
				inline: false
			});
		} else if (!this.battle.isComplete()) {
			embed.addFields({
				name: '🎯 Battle Status',
				value: 'Waiting for both players to select their actions...',
				inline: false
			});
		}

		// Team status
		const userTeam = this.battle.getUserCharacters();
		const opponentTeam = this.battle.getOpponentCharacters();

		const userStatus = userTeam.map(char => {
			const hpBar = this.createHPBar(char);
			const active = char === userCharacter ? '👑' : '';
			const status = char.isDefeated() ? '💀' : '';
			return `${active}${status} **${char.name}** ${hpBar}`;
		}).join('\n');

		const opponentStatus = opponentTeam.map(char => {
			const hpBar = this.createHPBar(char);
			const active = char === opponentCharacter ? '👑' : '';
			const status = char.isDefeated() ? '💀' : '';
			return `${active}${status} **${char.name}** ${hpBar}`;
		}).join('\n');

		embed.addFields(
			{
				name: '👤 Player 1 Team',
				value: userStatus || 'No characters available',
				inline: true
			},
			{
				name: '👥 Player 2 Team',
				value: opponentStatus || 'No characters available',
				inline: true
			},
			{
				name: '\u200b',
				value: '\u200b',
				inline: true
			}
		);

		// Battle log (last few actions)
		const recentLog = this.battle.getBattleLog().slice(-3);
		if (recentLog.length > 0) {
			embed.addFields({
				name: '📜 Recent Actions',
				value: recentLog.join('\n'),
				inline: false
			});
		}

		// Winner info if battle is complete
		if (this.battle.isComplete()) {
			const winner = this.battle.getWinner();
			const winnerName = winner === 'user' ? 'Player 1' : 'Player 2';
			embed.addFields({
				name: '🏆 Battle Result',
				value: `🎉 **${winnerName} Wins!**\n\n${this.battle.getBattleSummary()}`,
				inline: false
			});
		}

		embed.setFooter({ 
			text: this.battle.isComplete() 
				? 'Battle ended' 
				: 'Select your action below!' 
		});

		return embed;
	}

public createMoveSelectionMenu(isPlayer1?: boolean): ActionRowBuilder<StringSelectMenuBuilder> {
		const character = isPlayer1 !== false ? this.battle.state.userCharacter : this.battle.state.opponentCharacter;
		const party = isPlayer1 !== false ? this.battle.state.userParty : this.battle.state.opponentParty;
		const activeIndex = isPlayer1 !== false ? this.battle.state.userActiveIndex : this.battle.state.opponentActiveIndex;
		
		if (!character) {
			return new ActionRowBuilder<StringSelectMenuBuilder>();
		}

		const options: any[] = [];

		// Add technique options with enhanced descriptions
		character.techniques.forEach((technique) => {
			const canUse = character.currentMana >= technique.manaCost;
			if (canUse) {
				// Create more informative description
				let description = `${technique.affinity}`;
				if (technique.power > 0) {
					description += ` | ${technique.power} power`;
				}
				description += ` | ${technique.manaCost} MP`;
				
				// Add accuracy info
				if (technique.precision < 1.0) {
					const accuracyPercent = Math.round(technique.precision * 100);
					description += ` | ${accuracyPercent}% accuracy`;
				}

				// Add effect hints
				if (technique.effects && technique.effects.length > 0) {
					const effectCount = technique.effects.length;
					description += ` | +${effectCount} effect${effectCount > 1 ? 's' : ''}`;
				}

				options.push({
					label: `⚔️ ${technique.name}`,
					value: `attack_${technique.name}`,
					description: description,
					emoji: this.getAffinityEmoji(technique.affinity)
				});
			}
		});

		// Add disabled techniques for reference (but not selectable)
		const disabledTechniques = character.techniques.filter(tech => character.currentMana < tech.manaCost);
		if (disabledTechniques.length > 0 && options.length < 20) { // Leave room for other options
			disabledTechniques.slice(0, 3).forEach((technique) => { // Show max 3 disabled
				options.push({
					label: `❌ ${technique.name} (No MP)`,
					value: `disabled_${technique.name}`,
					description: `Requires ${technique.manaCost} MP (you have ${character.currentMana})`,
					emoji: '💔'
				});
			});
		}

		// Add switch options with enhanced info
		party.forEach((char, index) => {
			if (index !== activeIndex && !char.isDefeated()) {
				const hpPercent = Math.round((char.currentHP / char.maxHP) * 100);
				const mpPercent = Math.round((char.currentMana / char.maxMana) * 100);
				const conditions = char.getActiveConditions();
				const statusText = conditions.length > 0 ? ` | ${conditions.join(', ')}` : '';
				
				options.push({
					label: `🔄 Switch to ${char.name}`,
					value: `switch_${char.name}`,
					description: `Level ${char.level} | ${hpPercent}% HP, ${mpPercent}% MP${statusText}`,
					emoji: this.getRaceEmoji(char.races[0])
				});
			}
		});

		// Add forfeit option
		options.push({
			label: '🏃 Forfeit Battle',
			value: 'flee',
			description: 'Surrender and end the battle immediately',
			emoji: '🏃'
		});

		// Limit to Discord's max of 25 options
		const limitedOptions = options.slice(0, 25);

		const placeholderText = options.length > 4 ? 
			`Choose your action... (${limitedOptions.filter(opt => !opt.value.startsWith('disabled_')).length} available)` : 
			'Choose your action...';

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('battle_move_select')
			.setPlaceholder(placeholderText)
			.addOptions(limitedOptions);

		return new ActionRowBuilder<StringSelectMenuBuilder>()
			.addComponents(selectMenu);
	}

	public createPlayerMoveEmbed(playerId: string, session: any): EmbedBuilder {
		const isPlayer1 = playerId === session.player1Id;
		const playerName = isPlayer1 ? 'Player 1' : 'Player 2';
		const character = isPlayer1 ? this.battle.state.userCharacter : this.battle.state.opponentCharacter;
		const opponentCharacter = isPlayer1 ? this.battle.state.opponentCharacter : this.battle.state.userCharacter;
		
		const currentTurn = session ? session.currentTurn : this.battle.state.turn;
		const embed = new EmbedBuilder()
			.setTitle(`🎯 ${playerName} - Your Turn`)
			.setColor(0x2ecc71)
			.setDescription(`**Turn ${currentTurn}** - Make your move!`);

		if (character) {
			// Character status with visual health bar
			const hpBar = this.createHPBar(character);
			const manaBar = this.createManaBar(character);
			
			// Get active conditions
			const conditions = character.getActiveConditions();
			const conditionText = conditions.length > 0 ? `\n🎭 **Status:** ${conditions.join(', ')}` : '';
			
			embed.addFields(
				{
					name: `👑 ${character.name} (Level ${character.level})`,
					value: `${hpBar} **${character.currentHP}**/**${character.maxHP}** HP\n${manaBar} **${character.currentMana}**/**${character.maxMana}** MP${conditionText}`,
					inline: false
				}
			);

			// Show available techniques count
			const availableTechniques = character.techniques.filter(tech => character.currentMana >= tech.manaCost);
			const unavailableTechniques = character.techniques.filter(tech => character.currentMana < tech.manaCost);
			
			embed.addFields({
				name: '⚔️ Available Actions',
				value: `**${availableTechniques.length}** techniques ready\n**${unavailableTechniques.length}** techniques on cooldown (not enough MP)`,
				inline: true
			});

			// Show opponent status briefly
			if (opponentCharacter) {
				const oppHpPercent = Math.round((opponentCharacter.currentHP / opponentCharacter.maxHP) * 100);
				const oppManaPercent = Math.round((opponentCharacter.currentMana / opponentCharacter.maxMana) * 100);
				embed.addFields({
					name: '👀 Opponent Status',
					value: `**${opponentCharacter.name}**\n❤️ ${oppHpPercent}% HP | 💙 ${oppManaPercent}% MP`,
					inline: true
				});
			}
		}

		// Show turn status
		const opponentId = isPlayer1 ? session.player2Id : session.player1Id;
		const opponentHasActed = session.playerActions.get(opponentId);
		const playerHasActed = session.playerActions.get(playerId);

		if (playerHasActed) {
			embed.addFields({
				name: '✅ Move Selected',
				value: `You've chosen your action for Turn ${currentTurn}.\n${opponentHasActed ? '🔄 **Both players ready** - processing turn!' : '⏳ Waiting for opponent...'}`,
				inline: false
			});
			embed.setColor(0x95a5a6); // Gray color when waiting
		} else {
			const urgencyText = opponentHasActed ? '🔥 **Opponent is ready!** Choose quickly!' : '⏳ Take your time to choose wisely.';
			embed.addFields({
				name: '🎯 Your Turn',
				value: `${urgencyText}\nSelect your technique or action from the menu below.`,
				inline: false
			});
		}

		// Add helpful footer
		if (!playerHasActed) {
			embed.setFooter({
				text: '💡 Tip: Consider your MP, opponent\'s status, and strategy!'
			});
		} else {
			embed.setFooter({
				text: 'Move locked in! Check the main battle thread for updates.'
			});
		}

		return embed;
	}

	public createBattleLogEmbed(session: any): EmbedBuilder {
		const currentTurn = session ? session.currentTurn : this.battle.state.turn;
		const embed = new EmbedBuilder()
			.setTitle(`⚔️ Live Battle`)
			.setColor(this.battle.isComplete() ? 0xe74c3c : 0x3498db);

		// Add battle turn info and status in the description
		if (this.battle.isComplete()) {
			const winner = this.battle.getWinner();
			const winnerName = winner === 'user' ? 'Player 1' : 'Player 2';
			embed.setDescription(`🏆 **Battle Complete!** 
**Winner:** ${winnerName} 🎉
**Final Turn:** ${currentTurn}`);
		} else {
			const player1HasActed = session.playerActions.get(session.player1Id);
			const player2HasActed = session.playerActions.get(session.player2Id);
			
			let description = `🎯 **Turn ${currentTurn}**\n`;
			
			if (player1HasActed && player2HasActed) {
				description += '⚙️ **Processing turn...** Both players ready!';
			} else {
				const p1Status = player1HasActed ? '✅ Ready' : '⏳ Selecting';
				const p2Status = player2HasActed ? '✅ Ready' : '⏳ Selecting';
				description += `**Player 1:** ${p1Status}\n**Player 2:** ${p2Status}`;
			}
			
			embed.setDescription(description);
		}

		// Current characters with enhanced visuals
		const userChar = this.battle.state.userCharacter;
		const opponentChar = this.battle.state.opponentCharacter;

		if (userChar && opponentChar) {
			// Add character conditions display
			const p1Conditions = userChar.getActiveConditions();
			const p2Conditions = opponentChar.getActiveConditions();
			
			const p1ConditionText = p1Conditions.length > 0 ? `\n🎭 ${p1Conditions.join(', ')}` : '';
			const p2ConditionText = p2Conditions.length > 0 ? `\n🎭 ${p2Conditions.join(', ')}` : '';
			
			embed.addFields(
				{
					name: `👤 Player 1 - ${userChar.name}`,
					value: `${this.createHPBar(userChar)} **${userChar.currentHP}**/**${userChar.maxHP}** HP\n💙 **${userChar.currentMana}**/**${userChar.maxMana}** MP${p1ConditionText}`,
					inline: true
				},
				{
					name: '\u200b',
					value: '⚔️\n**VS**',
					inline: true
				},
				{
					name: `👤 Player 2 - ${opponentChar.name}`,
					value: `${this.createHPBar(opponentChar)} **${opponentChar.currentHP}**/**${opponentChar.maxHP}** HP\n💙 **${opponentChar.currentMana}**/**${opponentChar.maxMana}** MP${p2ConditionText}`,
					inline: true
				}
			);
		}

		// Recent battle log with better formatting
		const recentLog = this.battle.getBattleLog().slice(-4);
		if (recentLog.length > 0) {
			const logText = recentLog.map((log, index) => {
				const prefix = index === recentLog.length - 1 ? '📍' : '▫️';
				return `${prefix} ${log}`;
			}).join('\n');
			
			embed.addFields({
				name: '📜 Recent Battle Actions',
				value: logText,
				inline: false
			});
		}

		// Add footer with thread links if not completed
		if (!this.battle.isComplete()) {
			embed.setFooter({ 
				text: '💡 Check your private thread to select moves!' 
			});
		} else {
			embed.setFooter({ 
				text: 'Battle completed! Threads will be archived soon.' 
			});
		}

		return embed;
	}



	public createCharacterDetailEmbed(character: Character): EmbedBuilder {
		// const hpPercentage = (character.currentHP / character.maxHP) * 100;
		// const manaPercentage = (character.currentMana / character.maxMana) * 100;

		const embed = new EmbedBuilder()
			.setTitle(`📊 ${character.name}`)
			.setColor(character.isDefeated() ? 0x95a5a6 : 0x3498db)
			.setDescription(`Level ${character.level} ${character.races.join('/')} Character`);

		// Status bars
		embed.addFields(
			{
				name: '❤️ HP',
				value: `${this.createHPBar(character)} ${character.currentHP}/${character.maxHP}`,
				inline: true
			},
			{
				name: '💙 Mana',
				value: `${this.createManaBar(character)} ${character.currentMana}/${character.maxMana}`,
				inline: true
			},
			{
				name: '\u200b',
				value: '\u200b',
				inline: true
			}
		);

		// Stats
		embed.addFields({
			name: '📊 Battle Stats',
			value: [
				`⚔️ Attack: ${character.getEffectiveStats().attack}`,
				`🛡️ Defense: ${character.getEffectiveStats().defense}`,
				`🔮 Magic Attack: ${character.getEffectiveStats().magicAttack}`,
				`✨ Magic Defense: ${character.getEffectiveStats().magicDefense}`,
				`💨 Speed: ${character.getEffectiveStats().speed}`
			].join('\n'),
			inline: true
		});

		// Status conditions
		const conditions = character.getActiveConditions();
		if (conditions.length > 0) {
			embed.addFields({
				name: '🎭 Status Effects',
				value: conditions.map(condition => `• ${condition}`).join('\n'),
				inline: true
			});
		}

		// Techniques
		const techniques = character.techniques.slice(0, 4); // Show first 4
		if (techniques.length > 0) {
			embed.addFields({
				name: '🎯 Available Techniques',
				value: techniques.map(technique => {
					return `• ${technique.name} (${technique.manaCost} MP)`;
				}).join('\n'),
				inline: false
			});
		}

		if (character.isDefeated()) {
			embed.setFooter({ text: '💀 This character is defeated' });
		}

		return embed;
	}

	public createBattleResultEmbed(): EmbedBuilder {
		const winner = this.battle.getWinner();
		const winnerName = this.battle.getWinnerName();

		const embed = new EmbedBuilder()
			.setTitle('🏆 Battle Complete!')
			.setColor(winner === 'user' ? 0x2ecc71 : winner === 'opponent' ? 0xe74c3c : 0x95a5a6);

		// Enhanced victory description
		const victoryEmoji = winner === 'user' ? '🎉' : winner === 'opponent' ? '🎊' : '🤝';
		embed.setDescription(`${victoryEmoji} **${winnerName}** has emerged victorious!`);

		// Show final character states
		const userChar = this.battle.state.userCharacter;
		const opponentChar = this.battle.state.opponentCharacter;
		
		if (userChar && opponentChar) {
			const userTeam = this.battle.getUserCharacters();
			const opponentTeam = this.battle.getOpponentCharacters();
			
			const userSurvivors = userTeam.filter(char => !char.isDefeated()).length;
			const opponentSurvivors = opponentTeam.filter(char => !char.isDefeated()).length;
			
			embed.addFields(
				{
					name: '👤 Player 1 Final Status',
					value: `**${userChar.name}**\n${this.createHPBar(userChar)}\n❤️ ${userChar.currentHP}/${userChar.maxHP} HP\n👥 ${userSurvivors}/${userTeam.length} characters remaining`,
					inline: true
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: true
				},
				{
					name: '👤 Player 2 Final Status',
					value: `**${opponentChar.name}**\n${this.createHPBar(opponentChar)}\n❤️ ${opponentChar.currentHP}/${opponentChar.maxHP} HP\n👥 ${opponentSurvivors}/${opponentTeam.length} characters remaining`,
					inline: true
				}
			);
		}

		// Add battle statistics
		const totalTurns = this.battle.state.turn;
		const battleLog = this.battle.getBattleLog();
		const totalActions = battleLog.length;
		
		embed.addFields({
			name: '📊 Battle Statistics',
			value: `🕐 **Duration:** ${totalTurns} turns\n⚔️ **Total Actions:** ${totalActions}\n🎯 **Battle ID:** \`${Date.now().toString(36)}\``,
			inline: false
		});

		// Show key battle moments (last few important actions)
		const importantLog = this.battle.getBattleLog()
			.filter(log => log.includes('defeated') || log.includes('switched') || log.includes('critical'))
			.slice(-3);
			
		if (importantLog.length > 0) {
			embed.addFields({
				name: '⭐ Key Battle Moments',
				value: importantLog.map(log => `• ${log}`).join('\n'),
				inline: false
			});
		}

		embed.setFooter({ 
			text: '🎮 GG! Use /battle @user to challenge another player'
		});

		return embed;
	}

	private createHPBar(character: Character): string {
		const percentage = (character.currentHP / character.maxHP) * 100;
		const barLength = 10;
		const filledBars = Math.floor((percentage / 100) * barLength);
		const emptyBars = barLength - filledBars;

		let hpBar = '';
		if (percentage > 60) {
			hpBar = '🟩'.repeat(filledBars) + '⬜'.repeat(emptyBars);
		} else if (percentage > 30) {
			hpBar = '🟨'.repeat(filledBars) + '⬜'.repeat(emptyBars);
		} else {
			hpBar = '🟥'.repeat(filledBars) + '⬜'.repeat(emptyBars);
		}

		return hpBar;
	}

	private createManaBar(character: Character): string {
		const percentage = (character.currentMana / character.maxMana) * 100;
		const barLength = 8;
		const filledBars = Math.floor((percentage / 100) * barLength);
		const emptyBars = barLength - filledBars;

		return '🟦'.repeat(filledBars) + '⬜'.repeat(emptyBars);
	}

	private getAffinityEmoji(affinity: string): string {
		const emojiMap: { [key: string]: string } = {
			'Elemental_Fire': '🔥',
			'Elemental_Water': '💧',
			'Elemental_Wind': '💨',
			'Elemental_Earth': '🗿',
			'Physical': '⚔️',
			'Healing': '💚',
			'Support': '🛡️',
			'Illusion': '✨',
			'Dark': '🌑',
			'Light': '☀️'
		};
		return emojiMap[affinity] || '⭐';
	}

	private getRaceEmoji(race: string): string {
		const emojiMap: { [key: string]: string } = {
			'Human': '👤',
			'Elf': '🧝',
			'Demon': '👹',
			'Dragon': '🐲',
			'Beast': '🐺',
			'Undead': '💀',
			'Spirit': '👻'
		};
		return emojiMap[race] || '👤';
	}
}