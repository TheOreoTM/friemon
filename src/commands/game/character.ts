import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { CharacterRegistry } from '../../lib/characters/CharacterRegistry';

@ApplyOptions<Command.Options>({
	description: 'View and manage your characters'
})
export class CharacterCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('character')
				.setDescription('Character management commands')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('list')
						.setDescription('View your character collection')
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('info')
						.setDescription('View detailed character information')
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription('Character name to view')
								.setRequired(true)
								.setAutocomplete(true)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('team')
						.setDescription('View or set your battle team')
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('catalog')
						.setDescription('View all available characters')
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case 'list':
				return this.handleList(interaction);
			case 'info':
				return this.handleInfo(interaction);
			case 'team':
				return this.handleTeam(interaction);
			case 'catalog':
				return this.handleCatalog(interaction);
			default:
				return interaction.reply({ content: 'Invalid subcommand!', ephemeral: true });
		}
	}

	private async handleList(interaction: Command.ChatInputCommandInteraction) {
		// TODO: Fetch user's characters from database
		// For now, show starter characters as owned
		const ownedCharacters = CharacterRegistry.getStarterCharacters();
		
		const embed = new EmbedBuilder()
			.setTitle(`${interaction.user.username}'s Character Collection`)
			.setColor(0x3498db)
			.setDescription(ownedCharacters.length > 0 
				? 'Your owned characters:' 
				: 'You don\'t own any characters yet! Use `/shop` to get started.'
			);

		if (ownedCharacters.length > 0) {
			ownedCharacters.forEach((char, index) => {
				const displayInfo = char.getDisplayInfo();
				const tier = this.getTierFromLevel(displayInfo.level);
				embed.addFields({
					name: `${index + 1}. ${displayInfo.emoji} ${displayInfo.name}`,
					value: `**Level:** ${displayInfo.level}\n**Races:** ${displayInfo.races.join(', ')}\n**Tier:** ${tier}`,
					inline: true
				});
			});
		}

		embed.setFooter({ text: `Total Characters: ${ownedCharacters.length}` });

		return interaction.reply({ embeds: [embed] });
	}

	private async handleInfo(interaction: Command.ChatInputCommandInteraction) {
		const characterName = interaction.options.getString('name', true);
		
		// Find character in the new system
		const character = CharacterRegistry.getAllCharacters().find(char => 
			char.characterName.toLowerCase() === characterName.toLowerCase()
		);

		if (!character) {
			return interaction.reply({ 
				content: `Character "${characterName}" not found!`, 
				ephemeral: true 
			});
		}

		const displayInfo = character.getDisplayInfo();
		const tier = this.getTierFromLevel(displayInfo.level);

		const embed = new EmbedBuilder()
			.setTitle(`${displayInfo.emoji} ${displayInfo.name}`)
			.setColor(displayInfo.color)
			.setDescription(`**Tier:** ${tier}\n**Races:** ${displayInfo.races.join(', ')}\n\n${displayInfo.description || 'A skilled fighter ready for battle.'}`);

		// Stats
		embed.addFields(
			{
				name: '📊 Base Stats',
				value: [
					`❤️ HP: ${character.baseStats.hp}`,
					`⚔️ Attack: ${character.baseStats.attack}`,
					`🛡️ Defense: ${character.baseStats.defense}`,
					`🔮 Magic Attack: ${character.baseStats.magicAttack}`,
					`✨ Magic Defense: ${character.baseStats.magicDefense}`,
					`💨 Speed: ${character.baseStats.speed}`
				].join('\n'),
				inline: true
			},
			{
				name: '🎭 Ability',
				value: `**${displayInfo.ability}**\n${displayInfo.abilityDescription}`,
				inline: false
			},
			{
				name: '🎯 Techniques',
				value: character.techniques.length > 0 
					? character.techniques.map(tech => `• **${tech.name}** (${tech.manaCost} MP)`).join('\n')
					: 'No techniques learned',
				inline: true
			}
		);

		if (displayInfo.imageUrl) {
			embed.setThumbnail(displayInfo.imageUrl);
		}

		embed.setFooter({ text: `Level: ${displayInfo.level} | Total Stats: ${displayInfo.statTotal}` });

		return interaction.reply({ embeds: [embed] });
	}

	private async handleTeam(interaction: Command.ChatInputCommandInteraction) {
		// TODO: Fetch user's current team from database
		const team = CharacterRegistry.getStarterCharacters().slice(0, 3);

		const embed = new EmbedBuilder()
			.setTitle('Your Battle Team')
			.setColor(0xe74c3c)
			.setDescription('Your current battle team:');

		team.forEach((char, index) => {
			const displayInfo = char.getDisplayInfo();
			embed.addFields({
				name: `${index + 1}. ${displayInfo.emoji} ${displayInfo.name}`,
				value: `Level ${displayInfo.level} ${displayInfo.races.join('/')}`,
				inline: true
			});
		});

		embed.setFooter({ text: 'Use /character set-team to change your team' });

		return interaction.reply({ embeds: [embed] });
	}

	private async handleCatalog(interaction: Command.ChatInputCommandInteraction) {
		const characters = CharacterRegistry.getAllCharacters();
		const totalCharacters = characters.length;
		
		// Group by tier (based on level)
		const tierGroups: { [tier: string]: typeof characters } = {};
		characters.forEach(char => {
			const displayInfo = char.getDisplayInfo();
			const tier = this.getTierFromLevel(displayInfo.level);
			if (!tierGroups[tier]) tierGroups[tier] = [];
			tierGroups[tier].push(char);
		});

		const embed = new EmbedBuilder()
			.setTitle('Character Catalog')
			.setColor(0x9b59b6)
			.setDescription(`All ${totalCharacters} available characters:`);

		// Display by tier
		const tierOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
		tierOrder.forEach(tier => {
			if (tierGroups[tier] && tierGroups[tier].length > 0) {
				const charList = tierGroups[tier].map(char => {
					const info = char.getDisplayInfo();
					return `${info.emoji} **${info.name}** (Lv.${info.level})`;
				}).join('\n');
				
				embed.addFields({
					name: `${tier} Tier (${tierGroups[tier].length})`,
					value: charList,
					inline: true
				});
			}
		});

		return interaction.reply({ embeds: [embed] });
	}

	private getTierFromLevel(level: number): string {
		if (level >= 70) return 'Legendary';
		if (level >= 50) return 'Epic';
		if (level >= 35) return 'Rare';
		if (level >= 20) return 'Uncommon';
		return 'Common';
	}


	public override async autocompleteRun(interaction: Command.AutocompleteInteraction) {
		const focusedValue = interaction.options.getFocused();
		const characters = CharacterRegistry.getAllCharacters();
		
		const filtered = characters
			.filter(char => char.characterName.toLowerCase().includes(focusedValue.toLowerCase()))
			.slice(0, 25)
			.map(char => {
				const displayInfo = char.getDisplayInfo();
				return {
					name: `${displayInfo.emoji} ${char.characterName}`,
					value: char.characterName
				};
			});

		return interaction.respond(filtered);
	}
}