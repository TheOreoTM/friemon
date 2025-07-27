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

		// Add technique options
		character.techniques.forEach((technique) => {
			if (character.currentMana >= technique.manaCost) {
				options.push({
					label: `⚔️ ${technique.name}`,
					value: `attack_${technique.name}`,
					description: `${technique.affinity} | ${technique.power} power | ${technique.manaCost} MP`,
					emoji: this.getAffinityEmoji(technique.affinity)
				});
			}
		});

		// Add switch options
		party.forEach((char, index) => {
			if (index !== activeIndex && !char.isDefeated()) {
				options.push({
					label: `🔄 Switch to ${char.name}`,
					value: `switch_${char.name}`,
					description: `Level ${char.level} | HP: ${char.currentHP}/${char.maxHP}`,
					emoji: this.getRaceEmoji(char.races[0])
				});
			}
		});

		// Add forfeit option
		options.push({
			label: '🏃 Forfeit Battle',
			value: 'flee',
			description: 'Surrender and end the battle',
			emoji: '🏃'
		});

		// Limit to Discord's max of 25 options
		const limitedOptions = options.slice(0, 25);

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('battle_move_select')
			.setPlaceholder('Choose your move...')
			.addOptions(limitedOptions);

		return new ActionRowBuilder<StringSelectMenuBuilder>()
			.addComponents(selectMenu);
	}

	public createPlayerMoveEmbed(playerId: string, session: any): EmbedBuilder {
		const isPlayer1 = playerId === session.player1Id;
		const playerName = isPlayer1 ? 'Player 1' : 'Player 2';
		const character = isPlayer1 ? this.battle.state.userCharacter : this.battle.state.opponentCharacter;
		
		const currentTurn = session ? session.currentTurn : this.battle.state.turn;
		const embed = new EmbedBuilder()
			.setTitle(`🎯 ${playerName} - Select Your Move`)
			.setColor(0x3498db)
			.setDescription(`Turn ${currentTurn} - Choose your action`);

		if (character) {
			embed.addFields(
				{
					name: '👑 Active Character',
					value: `**${character.name}** (Level ${character.level})`,
					inline: true
				},
				{
					name: '❤️ HP',
					value: `${character.currentHP}/${character.maxHP}`,
					inline: true
				},
				{
					name: '💫 Mana',
					value: `${character.currentMana}/${character.maxMana}`,
					inline: true
				}
			);
		}

		// Show if opponent has acted
		const opponentId = isPlayer1 ? session.player2Id : session.player1Id;
		const opponentHasActed = session.playerActions.get(opponentId);
		const playerHasActed = session.playerActions.get(playerId);

		if (playerHasActed) {
			embed.addFields({
				name: '✅ Status',
				value: 'You have selected your move. Waiting for opponent...',
				inline: false
			});
		} else {
			embed.addFields({
				name: '⏳ Status', 
				value: opponentHasActed ? 'Opponent is ready. Choose your move!' : 'Select your move from the menu below.',
				inline: false
			});
		}

		return embed;
	}

	public createBattleLogEmbed(session: any): EmbedBuilder {
		const currentTurn = session ? session.currentTurn : this.battle.state.turn;
		const embed = new EmbedBuilder()
			.setTitle('⚔️ Live Battle - Turn ' + currentTurn)
			.setColor(this.battle.isComplete() ? 0xe74c3c : 0xf39c12);

		if (this.battle.isComplete()) {
			const winner = this.battle.getWinner();
			const winnerName = winner === 'user' ? 'Player 1' : 'Player 2';
			embed.setDescription(`🏆 **Battle Complete!** ${winnerName} wins!`);
		} else {
			const player1HasActed = session.playerActions.get(session.player1Id);
			const player2HasActed = session.playerActions.get(session.player2Id);
			
			if (player1HasActed && player2HasActed) {
				embed.setDescription('⚙️ **Processing turn...** Both players have selected their moves!');
			} else {
				const status = [];
				if (player1HasActed) status.push('Player 1 ✅');
				else status.push('Player 1 ⏳');
				if (player2HasActed) status.push('Player 2 ✅');
				else status.push('Player 2 ⏳');
				
				embed.setDescription(`⏳ **Waiting for moves...** ${status.join(' | ')}`);
			}
		}

		// Current characters
		const userChar = this.battle.state.userCharacter;
		const opponentChar = this.battle.state.opponentCharacter;

		if (userChar && opponentChar) {
			embed.addFields(
				{
					name: '👥 Player 1',
					value: `**${userChar.name}** ${this.createHPBar(userChar)}\nHP: ${userChar.currentHP}/${userChar.maxHP}`,
					inline: true
				},
				{
					name: '🆚',
					value: '⚔️',
					inline: true
				},
				{
					name: '👥 Player 2',
					value: `**${opponentChar.name}** ${this.createHPBar(opponentChar)}\nHP: ${opponentChar.currentHP}/${opponentChar.maxHP}`,
					inline: true
				}
			);
		}

		// Recent battle log
		const recentLog = this.battle.getBattleLog().slice(-5);
		if (recentLog.length > 0) {
			embed.addFields({
				name: '📜 Battle Log',
				value: recentLog.join('\n'),
				inline: false
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