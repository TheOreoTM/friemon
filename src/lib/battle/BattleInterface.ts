import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Battle } from './Battle';
import { Character } from '../character/Character';
import { Technique } from '../character/Technique';
import type { BattleSession } from './BattleManager';

export class BattleInterface {
	private battle: Battle;

	constructor(battle: Battle) {
		this.battle = battle;
	}

	public createBattleStatusEmbed(session: BattleSession): EmbedBuilder {
		const userCharacter = this.battle.state.userCharacter;
		const opponentCharacter = this.battle.state.opponentCharacter;

		const currentTurn = session.currentTurn;
		const embed = new EmbedBuilder()
			.setTitle('⚔️ Player vs Player Battle')
			.setColor(this.battle.isComplete() ? 0xe74c3c : 0xf39c12)
			.setDescription(this.battle.isComplete() ? '🏆 **Battle Complete!**' : `⚡ **Turn ${currentTurn} - Both players choose actions**`);

		// Battle info
		if (!this.battle.isComplete() && session) {
			const player1HasActed = session.playerActions.get(session.user.id) || false;
			const player2HasActed = session.playerActions.get(session.opponent.id) || false;

			let statusText = '';
			if (player1HasActed && player2HasActed) {
				statusText = '✅ Both players have selected actions - processing turn...';
			} else if (player1HasActed) {
				statusText = `⏳ ${session.user.displayName} ready - waiting for ${session.opponent.displayName}...`;
			} else if (player2HasActed) {
				statusText = `⏳ ${session.opponent.displayName} ready - waiting for ${session.user.displayName}...`;
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

		// Team status with position numbers
		const userTeam = this.battle.getUserCharacters();
		const opponentTeam = this.battle.getOpponentCharacters();

		const userStatus = userTeam
			.map((char, index) => {
				const position = index + 1;
				const hpBar = this.createHPBar(char);
				const active = char === userCharacter ? '👑' : '';
				const status = char.isDefeated() ? '💀' : '';
				return `${position}.${active}${status} **${char.name}** ${hpBar}`;
			})
			.join('\n');

		const opponentStatus = opponentTeam
			.map((char, index) => {
				const position = index + 1;
				const hpBar = this.createHPBar(char);
				const active = char === opponentCharacter ? '👑' : '';
				const status = char.isDefeated() ? '💀' : '';
				return `${position}.${active}${status} **${char.name}** ${hpBar}`;
			})
			.join('\n');

		embed.addFields(
			{
				name: `👤 ${session.user.displayName} Team`,
				value: userStatus || 'No characters available',
				inline: true
			},
			{
				name: `👥 ${session.opponent.displayName} Team`,
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
			const winnerName = winner === 'user' ? session.user.displayName : session.opponent.displayName;
			embed.addFields({
				name: '🏆 Battle Result',
				value: `🎉 **${winnerName} Wins!**\n\n${this.battle.getBattleSummary()}`,
				inline: false
			});
		}

		embed.setFooter({
			text: this.battle.isComplete() ? 'Battle ended' : 'Select your action below!'
		});

		return embed;
	}

	public createMoveSelectionMenu(isPlayer1?: boolean): ActionRowBuilder<StringSelectMenuBuilder> {
		const character = isPlayer1 !== false ? this.battle.state.userCharacter : this.battle.state.opponentCharacter;

		if (!character) {
			return new ActionRowBuilder<StringSelectMenuBuilder>();
		}

		const options: Array<{ label: string; value: string; description: string; emoji?: string }> = [];

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

				// Add targeting info
				const targetingInfo = this.getTargetingDescription(technique.targetType, technique.multiTargetCount);
				if (targetingInfo) {
					description += ` | ${targetingInfo}`;
				}

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
		const disabledTechniques = character.techniques.filter((tech) => character.currentMana < tech.manaCost);
		if (disabledTechniques.length > 0 && options.length < 20) {
			// Leave room for other options
			disabledTechniques.slice(0, 3).forEach((technique) => {
				// Show max 3 disabled
				options.push({
					label: `❌ ${technique.name} (No MP)`,
					value: `disabled_${technique.name}`,
					description: `Requires ${technique.manaCost} MP (you have ${character.currentMana})`,
					emoji: '💔'
				});
			});
		}

		// Switch and forfeit are now handled by dedicated buttons
		// No additional options needed in the select menu

		// Limit to Discord's max of 25 options
		const limitedOptions = options.slice(0, 25);

		const availableAttacks = limitedOptions.filter((opt) => !opt.value.startsWith('disabled_')).length;
		const placeholderText = availableAttacks > 0 ? `Choose your technique... (${availableAttacks} available)` : 'No techniques available...';

		const selectMenu = new StringSelectMenuBuilder().setCustomId('battle_move_select').setPlaceholder(placeholderText).addOptions(limitedOptions);

		return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
	}

	public createPlayerMoveEmbed(playerId: string, session: BattleSession): EmbedBuilder {
		const isPlayer1 = playerId === session.user.id;
		const playerName = isPlayer1 ? session.user.displayName : session.opponent.displayName;
		const character = isPlayer1 ? this.battle.state.userCharacter : this.battle.state.opponentCharacter;
		const opponentCharacter = isPlayer1 ? this.battle.state.opponentCharacter : this.battle.state.userCharacter;

		const currentTurn = session.currentTurn;
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

			embed.addFields({
				name: `👑 ${character.name} (Level ${character.level})`,
				value: `${hpBar} **${character.currentHP}**/**${character.maxHP}** HP\n${manaBar} **${character.currentMana}**/**${character.maxMana}** MP${conditionText}`,
				inline: false
			});

			// Show available techniques count
			const availableTechniques = character.techniques.filter((tech) => character.currentMana >= tech.manaCost);
			const unavailableTechniques = character.techniques.filter((tech) => character.currentMana < tech.manaCost);

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
		const opponentId = isPlayer1 ? session.opponent.id : session.user.id;
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
				text: "💡 Tip: Consider your MP, opponent's status, and strategy!"
			});
		} else {
			embed.setFooter({
				text: 'Move locked in! Check the main battle thread for updates.'
			});
		}

		return embed;
	}

	public createBattleLogEmbed(session: BattleSession): EmbedBuilder {
		const currentTurn = session.currentTurn;
		const embed = new EmbedBuilder().setTitle(`⚔️ Live Battle`).setColor(this.battle.isComplete() ? 0xe74c3c : 0x3498db);

		// Add battle turn info and status in the description
		if (this.battle.isComplete()) {
			const winner = this.battle.getWinner();
			const winnerName = winner === 'user' ? session.user.displayName : session.opponent.displayName;
			embed.setDescription(`🏆 **Battle Complete!** 
**Winner:** ${winnerName} 🎉
**Final Turn:** ${currentTurn}`);
		} else {
			const player1HasActed = session.playerActions.get(session.user.id);
			const player2HasActed = session.playerActions.get(session.opponent.id);

			let description = `🎯 **Turn ${currentTurn}**\n`;

			if (player1HasActed && player2HasActed) {
				description += '⚙️ **Processing turn...** Both players ready!';
			} else {
				const p1Status = player1HasActed ? '✅ Ready' : '⏳ Selecting';
				const p2Status = player2HasActed ? '✅ Ready' : '⏳ Selecting';
				description += `**${session.user.displayName}:** ${p1Status}\n**${session.opponent.displayName}:** ${p2Status}`;
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
					name: `👤 ${session.user.displayName} - ${userChar.name}`,
					value: `${this.createHPBar(userChar)} **${userChar.currentHP}**/**${userChar.maxHP}** HP\n💙 **${userChar.currentMana}**/**${userChar.maxMana}** MP${p1ConditionText}`,
					inline: true
				},
				{
					name: '\u200b',
					value: '⚔️\n**VS**',
					inline: true
				},
				{
					name: `👤 ${session.opponent.displayName} - ${opponentChar.name}`,
					value: `${this.createHPBar(opponentChar)} **${opponentChar.currentHP}**/**${opponentChar.maxHP}** HP\n💙 **${opponentChar.currentMana}**/**${opponentChar.maxMana}** MP${p2ConditionText}`,
					inline: true
				}
			);
		}

		// Recent battle log with better formatting
		const recentLog = this.battle.getBattleLog().slice(-4);
		if (recentLog.length > 0) {
			const logText = recentLog
				.map((log, index) => {
					const prefix = index === recentLog.length - 1 ? '📍' : '▫️';
					return `${prefix} ${log}`;
				})
				.join('\n');

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
				value: conditions.map((condition) => `• ${condition}`).join('\n'),
				inline: true
			});
		}

		// Techniques
		const techniques = character.techniques.slice(0, 4); // Show first 4
		if (techniques.length > 0) {
			embed.addFields({
				name: '🎯 Available Techniques',
				value: techniques
					.map((technique) => {
						return `• ${technique.name} (${technique.manaCost} MP)`;
					})
					.join('\n'),
				inline: false
			});
		}

		if (character.isDefeated()) {
			embed.setFooter({ text: '💀 This character is defeated' });
		}

		return embed;
	}

	public createBattleResultEmbed(session: BattleSession): EmbedBuilder {
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

			const userSurvivors = userTeam.filter((char) => !char.isDefeated()).length;
			const opponentSurvivors = opponentTeam.filter((char) => !char.isDefeated()).length;

			embed.addFields(
				{
					name: `👤 ${session.user.displayName} Final Status`,
					value: `**${userChar.name}**\n${this.createHPBar(userChar)}\n❤️ ${userChar.currentHP}/${userChar.maxHP} HP\n👥 ${userSurvivors}/${userTeam.length} characters remaining`,
					inline: true
				},
				{
					name: '\u200b',
					value: '\u200b',
					inline: true
				},
				{
					name: `👤 ${session.opponent.displayName} Final Status`,
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
		const importantLog = this.battle
			.getBattleLog()
			.filter((log) => log.includes('defeated') || log.includes('switched') || log.includes('critical'))
			.slice(-3);

		if (importantLog.length > 0) {
			embed.addFields({
				name: '⭐ Key Battle Moments',
				value: importantLog.map((log) => `• ${log}`).join('\n'),
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
			Elemental_Fire: '🔥',
			Elemental_Water: '💧',
			Elemental_Wind: '💨',
			Elemental_Earth: '🗿',
			Physical: '⚔️',
			Healing: '💚',
			Support: '🛡️',
			Illusion: '✨',
			Dark: '🌑',
			Light: '☀️'
		};
		return emojiMap[affinity] || '⭐';
	}

	private getRaceEmoji(race: string): string {
		const emojiMap: { [key: string]: string } = {
			Human: '👤',
			Elf: '🧝',
			Demon: '👹',
			Dragon: '🐲',
			Beast: '🐺',
			Undead: '💀',
			Spirit: '👻'
		};
		return emojiMap[race] || '👤';
	}

	private getTargetingDescription(targetType: string, multiTargetCount?: number): string {
		const targetingMap: { [key: string]: string } = {
			single: 'Single target',
			chooseTarget: '🎯 Choose target',
			multiTarget: `Hits ${multiTargetCount || 2} enemies`,
			allEnemies: 'All enemies',
			self: 'Self only'
		};
		return targetingMap[targetType] || '';
	}

	public createTargetSelectionMenu(technique: Technique, availableTargets: Character[]): ActionRowBuilder<StringSelectMenuBuilder> | null {
		if (!this.battle.requiresTargetSelection(technique)) {
			return null;
		}

		const options = availableTargets.map((target, index) => {
			const hpPercent = Math.round((target.currentHP / target.maxHP) * 100);
			const position = this.battle.opponentTeam.findCharacter(target) + 1;

			return {
				label: `🎯 Target ${position}. ${target.name}`,
				value: `target_${target.name}_${index}`,
				description: `Level ${target.level} | ${hpPercent}% HP | ${target.currentMana}/${target.maxMana} MP`,
				emoji: this.getRaceEmoji(target.races[0])
			};
		});

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('battle_target_select')
			.setPlaceholder('Choose your target...')
			.addOptions(options);

		return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
	}

	/**
	 * Helper function to format character name with player display name
	 * @param character The character
	 * @param session The battle session to get player display names
	 * @returns Formatted string like "Frieren (Alice)"
	 */
	public formatCharacterWithPlayer(character: Character, session: BattleSession): string {
		const isPlayer1Character = this.battle.getUserCharacters().includes(character);
		const playerDisplayName = isPlayer1Character ? session.user.displayName : session.opponent.displayName;
		return `${character.name} (${playerDisplayName})`;
	}

	/**
	 * Creates team switching buttons for the player
	 * @param playerId The player's Discord ID
	 * @param session The battle session
	 * @returns ActionRowBuilder with team switching buttons
	 */
	public createTeamSwitchButtons(playerId: string, session: BattleSession): ActionRowBuilder<ButtonBuilder> {
		const isPlayer1 = playerId === session.user.id;
		const team = isPlayer1 ? this.battle.getUserCharacters() : this.battle.getOpponentCharacters();
		const activeCharacter = isPlayer1 ? this.battle.state.userCharacter : this.battle.state.opponentCharacter;

		const buttons = team.map((character, index) => {
			const position = index + 1;
			const isActive = character === activeCharacter;
			const isDead = character.isDefeated();

			let style: ButtonStyle;
			let disabled = false;

			if (isActive) {
				style = ButtonStyle.Success; // Green
				disabled = true;
			} else if (isDead) {
				style = ButtonStyle.Danger; // Red
				disabled = true;
			} else {
				style = ButtonStyle.Secondary; // Gray
			}

			return new ButtonBuilder()
				.setCustomId(`switch_${position}`)
				.setLabel(`${position}. ${character.name}`)
				.setStyle(style)
				.setDisabled(disabled);
		});

		return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
	}

	/**
	 * Creates the forfeit/flee button
	 * @returns ActionRowBuilder with forfeit button
	 */
	public createForfeitButton(): ActionRowBuilder<ButtonBuilder> {
		const forfeitButton = new ButtonBuilder()
			.setCustomId('battle_forfeit')
			.setLabel('Forfeit Battle')
			.setStyle(ButtonStyle.Danger)
			.setEmoji('🏳️');

		return new ActionRowBuilder<ButtonBuilder>().addComponents(forfeitButton);
	}

	/**
	 * Creates a character stats embed for a specific player's active character
	 * @param playerId The player's Discord ID
	 * @param session The battle session
	 * @returns EmbedBuilder with character stats and team info
	 */
	public createPlayerCharacterStatsEmbed(playerId: string, session: BattleSession): EmbedBuilder {
		const isPlayer1 = playerId === session.user.id;
		const playerDisplayName = isPlayer1 ? session.user.displayName : session.opponent.displayName;
		const activeCharacter = isPlayer1 ? this.battle.state.userCharacter : this.battle.state.opponentCharacter;
		const team = isPlayer1 ? this.battle.getUserCharacters() : this.battle.getOpponentCharacters();

		const embed = new EmbedBuilder().setTitle(`⚔️ ${playerDisplayName}'s Active Character`).setColor(isPlayer1 ? 0x3498db : 0xe74c3c);

		// Active character stats
		const hpBar = this.createHPBar(activeCharacter);
		const manaBar = this.createManaBar(activeCharacter);
		const hpPercent = Math.round((activeCharacter.currentHP / activeCharacter.maxHP) * 100);
		const manaPercent = Math.round((activeCharacter.currentMana / activeCharacter.maxMana) * 100);

		// Active conditions
		const conditions = activeCharacter.getActiveConditions();
		const conditionText = conditions.length > 0 ? `\n🎭 **Conditions:** ${conditions.join(', ')}` : '';

		embed.addFields({
			name: `👤 ${activeCharacter.name}`,
			value: [
				`${hpBar} **${activeCharacter.currentHP}**/**${activeCharacter.maxHP}** HP (${hpPercent}%)`,
				`${manaBar} **${activeCharacter.currentMana}**/**${activeCharacter.maxMana}** MP (${manaPercent}%)`,
				`⚡ **Level:** ${activeCharacter.level}${conditionText}`
			].join('\n'),
			inline: false
		});

		// Team overview (inactive members)
		const inactiveMembers = team.filter((char) => char !== activeCharacter);
		if (inactiveMembers.length > 0) {
			const teamInfo = inactiveMembers
				.map((char) => {
					const position = team.findIndex((teamChar) => teamChar === char) + 1;
					const status = char.isDefeated() ? ' 💀' : '';
					const conditions = char.getActiveConditions();
					const conditionSuffix = conditions.length > 0 ? ` [${conditions.join(', ')}]` : '';

					return `${position}. **${char.name}**: ${char.currentHP}/${char.maxHP} HP, ${char.currentMana}/${char.maxMana} MP${status}${conditionSuffix}`;
				})
				.join('\n');

			embed.addFields({
				name: '👥 Team Status',
				value: teamInfo || 'No other team members',
				inline: false
			});
		}

		return embed;
	}

	/**
	 * Creates both player character stats embeds for the battle log
	 * @param session The battle session
	 * @returns Array of embeds [player1Embed, player2Embed]
	 */
	public createBothPlayerStatsEmbeds(session: BattleSession): [EmbedBuilder, EmbedBuilder] {
		const player1Embed = this.createPlayerCharacterStatsEmbed(session.user.id, session);
		const player2Embed = this.createPlayerCharacterStatsEmbed(session.opponent.id, session);
		return [player1Embed, player2Embed];
	}
}
