import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { STARTER_CHARACTERS, CHARACTER_TIERS } from '../../lib/data/Characters';
import { TECHNIQUES } from '../../lib/data/Techniques';

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
		// const userId = interaction.user.id;
		
		// For now, show starter characters as owned
		const ownedCharacters = Object.values(STARTER_CHARACTERS).filter(char => char !== null).slice(0, 3);
		
		const embed = new EmbedBuilder()
			.setTitle(`${interaction.user.username}'s Character Collection`)
			.setColor(0x3498db)
			.setDescription(ownedCharacters.length > 0 
				? 'Your owned characters:' 
				: 'You don\'t own any characters yet! Use `/shop` to get started.'
			);

		if (ownedCharacters.length > 0) {
			ownedCharacters.forEach((char, index) => {
				if (char) {
					const tier = CHARACTER_TIERS[char.id] || 'Common';
					embed.addFields({
						name: `${index + 1}. ${char.name}`,
						value: `**Level:** ${char.level}\n**Races:** ${char.races.join(', ')}\n**Tier:** ${tier}`,
						inline: true
					});
				}
			});
		}

		embed.setFooter({ text: `Total Characters: ${ownedCharacters.length}` });

		return interaction.reply({ embeds: [embed] });
	}

	private async handleInfo(interaction: Command.ChatInputCommandInteraction) {
		const characterName = interaction.options.getString('name', true);
		
		// Find character in starter characters
		const character = Object.values(STARTER_CHARACTERS).filter(char => char !== null).find(
			char => char && char.name.toLowerCase() === characterName.toLowerCase()
		);

		if (!character) {
			return interaction.reply({ 
				content: `Character "${characterName}" not found!`, 
				ephemeral: true 
			});
		}

		const tier = CHARACTER_TIERS[character.id] || 'Common';
		const techniques = character.techniques.map(techName => {
			const technique = Object.values(TECHNIQUES).find(t => 
				t.name.toLowerCase() === techName.toLowerCase()
			);
			return technique ? technique.name : techName;
		});

		const embed = new EmbedBuilder()
			.setTitle(character.name)
			.setColor(this.getTierColor(tier))
			.setDescription(`**Tier:** ${tier}\n**Races:** ${character.races.join(', ')}`);

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
				name: '🎯 Techniques',
				value: techniques.length > 0 
					? techniques.map(t => `• ${t}`).join('\n')
					: 'No techniques learned',
				inline: true
			}
		);

		embed.setFooter({ text: `Level: ${character.level}` });

		return interaction.reply({ embeds: [embed] });
	}

	private async handleTeam(interaction: Command.ChatInputCommandInteraction) {
		// TODO: Fetch user's current team from database
		const team = Object.values(STARTER_CHARACTERS).filter(char => char !== null).slice(0, 3);

		const embed = new EmbedBuilder()
			.setTitle('Your Battle Team')
			.setColor(0xe74c3c)
			.setDescription('Your current battle team:');

		team.forEach((char, index) => {
			if (char) {
				embed.addFields({
					name: `${index + 1}. ${char.name}`,
					value: `Level ${char.level} ${char.races.join('/')}`,
					inline: true
				});
			}
		});

		embed.setFooter({ text: 'Use /character set-team to change your team' });

		return interaction.reply({ embeds: [embed] });
	}

	private async handleCatalog(interaction: Command.ChatInputCommandInteraction) {
		const characters = Object.values(STARTER_CHARACTERS).filter(char => char !== null);
		const totalCharacters = characters.length;
		
		// Group by tier
		const tierGroups: { [tier: string]: typeof characters } = {};
		characters.forEach(char => {
			if (char) {
				const tier = CHARACTER_TIERS[char.id] || 'Common';
				if (!tierGroups[tier]) tierGroups[tier] = [];
				tierGroups[tier].push(char);
			}
		});

		const embed = new EmbedBuilder()
			.setTitle('Character Catalog')
			.setColor(0x9b59b6)
			.setDescription(`All ${totalCharacters} available characters:`);

		// Display by tier
		Object.entries(tierGroups).forEach(([tier, chars]) => {
			const charList = chars.filter(char => char !== null).map(char => 
				`• ${char!.name} (Lv.${char!.level})`
			).join('\n');
			
			embed.addFields({
				name: `${tier} Tier (${chars.length})`,
				value: charList,
				inline: true
			});
		});

		return interaction.reply({ embeds: [embed] });
	}

	private getTierColor(tier: string): number {
		switch (tier) {
			case 'Common': return 0x95a5a6;
			case 'Uncommon': return 0x27ae60;
			case 'Rare': return 0x3498db;
			case 'Epic': return 0x9b59b6;
			case 'Legendary': return 0xf39c12;
			default: return 0x95a5a6;
		}
	}

	public override async autocompleteRun(interaction: Command.AutocompleteInteraction) {
		const focusedValue = interaction.options.getFocused();
		const characters = Object.values(STARTER_CHARACTERS).filter(char => char !== null);
		
		const filtered = characters
			.filter(char => char && char.name.toLowerCase().includes(focusedValue.toLowerCase()))
			.slice(0, 25)
			.map(char => ({
				name: char!.name,
				value: char!.name
			}));

		return interaction.respond(filtered);
	}
}