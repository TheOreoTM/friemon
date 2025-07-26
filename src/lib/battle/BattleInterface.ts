import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { Battle } from './Battle';
import { Character } from '../character/Character';
import { getTechniqueByName } from '../data/Techniques';

export class BattleInterface {
	private battle: Battle;

	constructor(battle: Battle) {
		this.battle = battle;
	}

	public createBattleStatusEmbed(): EmbedBuilder {
		const userCharacter = this.battle.state.userCharacter;
		const opponentCharacter = this.battle.state.opponentCharacter;
		
		const embed = new EmbedBuilder()
			.setTitle('⚔️ Player vs Player Battle')
			.setColor(this.battle.isComplete() ? 0xe74c3c : 0xf39c12)
			.setDescription(this.battle.isComplete() ? '🏆 **Battle Complete!**' : `⚡ **Turn ${this.battle.state.turn} - Both players choose actions**`);

		// Battle info
		if (!this.battle.isComplete()) {
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

	public createActionButtons(): ActionRowBuilder<ButtonBuilder> {
		const isComplete = this.battle.isComplete();
		
		return new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('battle_attack')
					.setLabel('⚔️ Attack')
					.setStyle(ButtonStyle.Danger)
					.setDisabled(isComplete),
				new ButtonBuilder()
					.setCustomId('battle_switch')
					.setLabel('🔄 Switch')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(isComplete),
				new ButtonBuilder()
					.setCustomId('battle_item')
					.setLabel('🎒 Item')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(true), // Items not implemented
				new ButtonBuilder()
					.setCustomId('battle_flee')
					.setLabel('🏃 Forfeit')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(isComplete)
			);
	}

	public createTechniqueSelectMenu(isPlayer1?: boolean): ActionRowBuilder<StringSelectMenuBuilder> {
		// Default to player 1's character if not specified
		const character = isPlayer1 !== false ? this.battle.state.userCharacter : this.battle.state.opponentCharacter;
		if (!character) {
			return new ActionRowBuilder<StringSelectMenuBuilder>();
		}

		const options = character.techniques.filter(techName => {
			const technique = getTechniqueByName(techName);
			return technique && character.currentMana >= technique.manaCost;
		}).map(techName => {
			const technique = getTechniqueByName(techName);
			
			if (!technique) {
				return {
					label: techName,
					value: techName,
					description: 'Unknown technique'
				};
			}

			return {
				label: technique.name,
				value: technique.name,
				description: `${technique.affinity} | ${technique.power} power | ${technique.manaCost} MP`,
				emoji: this.getAffinityEmoji(technique.affinity)
			};
		}).slice(0, 25); // Discord limit

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('battle_technique_select')
			.setPlaceholder('Choose a technique to use...')
			.addOptions(options);

		return new ActionRowBuilder<StringSelectMenuBuilder>()
			.addComponents(selectMenu);
	}

	public createSwitchSelectMenu(isPlayer1?: boolean): ActionRowBuilder<StringSelectMenuBuilder> {
		const party = isPlayer1 !== false ? this.battle.state.userParty : this.battle.state.opponentParty;
		const currentChar = isPlayer1 !== false ? this.battle.state.userCharacter : this.battle.state.opponentCharacter;
		const availableCharacters = party.filter(char => 
			!char.isDefeated() && char !== currentChar
		);

		if (availableCharacters.length === 0) {
			return new ActionRowBuilder<StringSelectMenuBuilder>();
		}

		const options = availableCharacters.map(char => ({
			label: char.name,
			value: char.name,
			description: `Level ${char.level} | HP: ${char.currentHP}/${char.maxHP}`,
			emoji: this.getRaceEmoji(char.races[0])
		}));

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('battle_switch_select')
			.setPlaceholder('Choose a character to switch to...')
			.addOptions(options);

		return new ActionRowBuilder<StringSelectMenuBuilder>()
			.addComponents(selectMenu);
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
				value: techniques.map(tech => {
					const technique = getTechniqueByName(tech);
					return technique 
						? `• ${technique.name} (${technique.manaCost} MP)`
						: `• ${tech}`;
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
			.setColor(winner === 'user' ? 0x2ecc71 : winner === 'opponent' ? 0xe74c3c : 0x95a5a6)
			.setDescription(`**${winnerName}** has won the battle!`);

		// Add battle summary
		embed.addFields({
			name: '📊 Battle Summary',
			value: this.battle.getBattleSummary(),
			inline: false
		});

		// Show final battle log
		const recentLog = this.battle.getBattleLog().slice(-5);
		if (recentLog.length > 0) {
			embed.addFields({
				name: '📜 Final Battle Log',
				value: recentLog.join('\n'),
				inline: false
			});
		}


		embed.setFooter({ 
			text: 'Thanks for playing! Challenge someone else with /battle @user'
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