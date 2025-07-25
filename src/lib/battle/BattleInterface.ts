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
		const currentCharacter = this.battle.getCurrentCharacter();
		const opponent = this.battle.getOpponentCharacter();
		
		const embed = new EmbedBuilder()
			.setTitle('⚔️ Battle in Progress')
			.setColor(this.battle.isComplete() ? 0xe74c3c : 0xf39c12)
			.setDescription(this.battle.isComplete() ? '🏆 **Battle Complete!**' : '⚡ **Battle Active**');

		// Current turn info
		if (currentCharacter && !this.battle.isComplete()) {
			embed.addFields({
				name: '🎯 Current Turn',
				value: `**${currentCharacter.name}** is ready to act!`,
				inline: false
			});
		}

		// Team status
		const userTeam = this.battle.getUserCharacters();
		const aiTeam = this.battle.getAICharacters();

		const userStatus = userTeam.map(char => {
			const hpBar = this.createHPBar(char);
			const active = char === currentCharacter ? '👑' : '';
			return `${active} **${char.name}** ${hpBar}`;
		}).join('\n');

		const aiStatus = aiTeam.map(char => {
			const hpBar = this.createHPBar(char);
			const active = char === opponent ? '👑' : '';
			return `${active} **${char.name}** ${hpBar}`;
		}).join('\n');

		embed.addFields(
			{
				name: '👤 Your Team',
				value: userStatus || 'No characters available',
				inline: true
			},
			{
				name: '🤖 Opponent Team',
				value: aiStatus || 'No characters available',
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
			embed.addFields({
				name: '🏆 Winner',
				value: winner === 'user' ? '🎉 **You Won!**' : '💀 **You Lost!**',
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
		return new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('battle_attack')
					.setLabel('⚔️ Attack')
					.setStyle(ButtonStyle.Danger)
					.setDisabled(this.battle.isComplete()),
				new ButtonBuilder()
					.setCustomId('battle_switch')
					.setLabel('🔄 Switch')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(this.battle.isComplete()),
				new ButtonBuilder()
					.setCustomId('battle_item')
					.setLabel('🎒 Item')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(this.battle.isComplete()),
				new ButtonBuilder()
					.setCustomId('battle_flee')
					.setLabel('🏃 Flee')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(this.battle.isComplete())
			);
	}

	public createTechniqueSelectMenu(): ActionRowBuilder<StringSelectMenuBuilder> {
		const currentCharacter = this.battle.getCurrentCharacter();
		if (!currentCharacter) {
			return new ActionRowBuilder<StringSelectMenuBuilder>();
		}

		const options = currentCharacter.techniques.map(techName => {
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

	public createSwitchSelectMenu(): ActionRowBuilder<StringSelectMenuBuilder> {
		const availableCharacters = this.battle.getUserCharacters().filter(char => 
			!char.isDefeated() && char !== this.battle.getCurrentCharacter()
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
		const isUserWin = winner === 'user';

		const embed = new EmbedBuilder()
			.setTitle(isUserWin ? '🎉 Victory!' : '💀 Defeat!')
			.setColor(isUserWin ? 0x2ecc71 : 0xe74c3c)
			.setDescription(isUserWin 
				? 'Congratulations! You have emerged victorious!'
				: 'Better luck next time! Don\'t give up!'
			);

		// Battle statistics
		const battleLog = this.battle.getBattleLog();
		const turnCount = battleLog.length;
		
		embed.addFields(
			{
				name: '📊 Battle Statistics',
				value: [
					`⏱️ Duration: ${turnCount} turns`,
					`🎯 Total Actions: ${battleLog.length}`,
				].join('\n'),
				inline: true
			}
		);

		// Rewards (if won)
		if (isUserWin) {
			const baseReward = 50;
			const bonusReward = Math.floor(Math.random() * 25) + 10;
			const totalReward = baseReward + bonusReward;

			embed.addFields({
				name: '🎁 Battle Rewards',
				value: [
					`💰 Coins: +${totalReward}`,
					`⭐ Experience: +${Math.floor(totalReward * 0.8)}`,
					`📈 Ranking: +10 points`
				].join('\n'),
				inline: true
			});
		}

		// Team final status
		const userTeam = this.battle.getUserCharacters();
		const survivingCount = userTeam.filter(char => !char.isDefeated()).length;
		
		embed.addFields({
			name: '👥 Team Status',
			value: `${survivingCount}/${userTeam.length} characters remaining`,
			inline: false
		});

		embed.setFooter({ 
			text: isUserWin 
				? 'Use /battle ai to start another battle!' 
				: 'Train your characters and try again!'
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