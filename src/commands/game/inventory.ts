import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { STARTER_CHARACTERS, CHARACTER_TIERS } from '../../lib/data/Characters';
import { EQUIPMENT } from '../../lib/data/Equipment';

@ApplyOptions<Command.Options>({
	description: 'Manage your inventory and equipment'
})
export class InventoryCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('inventory')
				.setDescription('View and manage your inventory')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('view')
						.setDescription('View your inventory')
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('equip')
						.setDescription('Equip an item to a character')
						.addStringOption((option) =>
							option
								.setName('equipment')
								.setDescription('Equipment to equip')
								.setRequired(true)
								.setAutocomplete(true)
						)
						.addStringOption((option) =>
							option
								.setName('character')
								.setDescription('Character to equip to')
								.setRequired(true)
								.setAutocomplete(true)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('unequip')
						.setDescription('Unequip an item from a character')
						.addStringOption((option) =>
							option
								.setName('character')
								.setDescription('Character to unequip from')
								.setRequired(true)
								.setAutocomplete(true)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('sell')
						.setDescription('Sell an item for coins')
						.addStringOption((option) =>
							option
								.setName('item')
								.setDescription('Item to sell')
								.setRequired(true)
								.setAutocomplete(true)
						)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case 'view':
				return this.handleView(interaction);
			case 'equip':
				return this.handleEquip(interaction);
			case 'unequip':
				return this.handleUnequip(interaction);
			case 'sell':
				return this.handleSell(interaction);
			default:
				return interaction.reply({ content: 'Invalid subcommand!', ephemeral: true });
		}
	}

	private async handleView(interaction: Command.ChatInputCommandInteraction) {
		// TODO: Fetch user's actual inventory from database
		// For now, showing sample inventory
		const ownedCharacters = Object.values(STARTER_CHARACTERS).slice(0, 5);
		const ownedEquipment = Object.values(EQUIPMENT).slice(0, 3);
		const currency = 1000;

		const embed = new EmbedBuilder()
			.setTitle(`🎒 ${interaction.user.username}'s Inventory`)
			.setColor(0x3498db)
			.setDescription(`**Balance:** ${currency} coins`);

		// Characters section
		if (ownedCharacters.length > 0) {
			const characterList = ownedCharacters.map((char, index) => {
				const charId = Object.keys(STARTER_CHARACTERS).find(
					id => STARTER_CHARACTERS[id].name === char.name
				);
				const tier = CHARACTER_TIERS[charId!] || 'Common';
				const equipped = index < 3 ? '⚔️' : ''; // First 3 are "in team"
				return `${equipped} **${char.name}** (Lv.${char.level}) - ${tier}`;
			}).join('\n');

			embed.addFields({
				name: `👥 Characters (${ownedCharacters.length})`,
				value: characterList,
				inline: false
			});
		}

		// Equipment section
		if (ownedEquipment.length > 0) {
			const equipmentList = ownedEquipment.map((eq, index) => {
				const equipped = index === 0 ? '🔧' : ''; // First item is "equipped"
				return `${equipped} **${eq.name}**\n   *${eq.description}*`;
			}).join('\n\n');

			embed.addFields({
				name: `⚔️ Equipment (${ownedEquipment.length})`,
				value: equipmentList,
				inline: false
			});
		}

		// Storage stats
		embed.addFields({
			name: '📊 Storage Info',
			value: [
				`**Characters:** ${ownedCharacters.length}/50`,
				`**Equipment:** ${ownedEquipment.length}/25`,
				`**Team Size:** 3/3`
			].join('\n'),
			inline: true
		});

		embed.setFooter({ text: '⚔️ = In Battle Team | 🔧 = Equipped' });

		const actionRow = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('inventory_characters')
					.setLabel('📋 Manage Team')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('inventory_equipment')
					.setLabel('⚔️ Manage Equipment')
					.setStyle(ButtonStyle.Secondary)
			);

		return interaction.reply({ 
			embeds: [embed], 
			components: [actionRow] 
		});
	}

	private async handleEquip(interaction: Command.ChatInputCommandInteraction) {
		const equipmentName = interaction.options.getString('equipment', true);
		const characterName = interaction.options.getString('character', true);

		// Find equipment and character
		const equipment = Object.values(EQUIPMENT).find(
			eq => eq.name.toLowerCase() === equipmentName.toLowerCase()
		);
		const character = Object.values(STARTER_CHARACTERS).find(
			char => char.name.toLowerCase() === characterName.toLowerCase()
		);

		if (!equipment) {
			return interaction.reply({ 
				content: `❌ Equipment "${equipmentName}" not found in your inventory!`, 
				ephemeral: true 
			});
		}

		if (!character) {
			return interaction.reply({ 
				content: `❌ Character "${characterName}" not found in your collection!`, 
				ephemeral: true 
			});
		}

		// TODO: Check ownership and update database
		const embed = new EmbedBuilder()
			.setTitle('✅ Equipment Equipped!')
			.setColor(0x2ecc71)
			.setDescription(`**${equipment.name}** has been equipped to **${character.name}**!`)
			.addFields(
				{
					name: '⚔️ Equipment Details',
					value: equipment.description,
					inline: false
				},
				{
					name: '📊 Character Info',
					value: [
						`**Level:** ${character.level}`,
						`**Races:** ${character.races.join(', ')}`
					].join('\n'),
					inline: true
				}
			)
			.setFooter({ text: 'Equipment effects will apply in battle!' });

		return interaction.reply({ embeds: [embed] });
	}

	private async handleUnequip(interaction: Command.ChatInputCommandInteraction) {
		const characterName = interaction.options.getString('character', true);

		const character = Object.values(STARTER_CHARACTERS).find(
			char => char.name.toLowerCase() === characterName.toLowerCase()
		);

		if (!character) {
			return interaction.reply({ 
				content: `❌ Character "${characterName}" not found in your collection!`, 
				ephemeral: true 
			});
		}

		// TODO: Check if character has equipment and update database
		const embed = new EmbedBuilder()
			.setTitle('✅ Equipment Unequipped!')
			.setColor(0xf39c12)
			.setDescription(`Equipment has been removed from **${character.name}**.`)
			.addFields({
				name: '📦 Returned to Inventory',
				value: 'The equipment has been returned to your inventory and can be equipped to another character.',
				inline: false
			})
			.setFooter({ text: 'Use /inventory equip to equip it to another character!' });

		return interaction.reply({ embeds: [embed] });
	}

	private async handleSell(interaction: Command.ChatInputCommandInteraction) {
		const itemName = interaction.options.getString('item', true);

		// Check if item is equipment
		const equipment = Object.values(EQUIPMENT).find(
			eq => eq.name.toLowerCase() === itemName.toLowerCase()
		);

		if (equipment) {
			const sellPrice = Math.floor(this.getEquipmentPrice(equipment.name) * 0.5); // 50% of buy price
			
			const embed = new EmbedBuilder()
				.setTitle('💰 Item Sold!')
				.setColor(0x2ecc71)
				.setDescription(`You have sold **${equipment.name}** for **${sellPrice} coins**!`)
				.addFields(
					{
						name: '💸 Transaction Details',
						value: [
							`**Item:** ${equipment.name}`,
							`**Sell Price:** ${sellPrice} coins`,
							`**New Balance:** ${1000 + sellPrice} coins` // TODO: Use actual balance
						].join('\n')
					}
				)
				.setFooter({ text: 'Coins have been added to your balance!' });

			// TODO: Remove item from user's inventory and add coins
			
			return interaction.reply({ embeds: [embed] });
		}

		// Check if item is a character (characters can't be sold)
		const character = Object.values(STARTER_CHARACTERS).find(
			char => char.name.toLowerCase() === itemName.toLowerCase()
		);

		if (character) {
			return interaction.reply({ 
				content: `❌ Characters cannot be sold! You can only sell equipment and items.`, 
				ephemeral: true 
			});
		}

		return interaction.reply({ 
			content: `❌ Item "${itemName}" not found in your inventory!`, 
			ephemeral: true 
		});
	}

	private getEquipmentPrice(equipName: string): number {
		const powerfulItems = ['Staff of Judgement', 'Axe of the Hero', 'Life Orb', 'Titan Gauntlets'];
		const moderateItems = ['Mana Crystal', 'Barrier Ring', 'Swift Boots', 'Arcane Orb'];
		
		if (powerfulItems.includes(equipName)) {
			return 800;
		} else if (moderateItems.includes(equipName)) {
			return 400;
		}
		return 200;
	}

	public override async autocompleteRun(interaction: Command.AutocompleteInteraction) {
		const focusedOption = interaction.options.getFocused(true);
		const focusedValue = focusedOption.value;

		if (focusedOption.name === 'equipment' || focusedOption.name === 'item') {
			// Return equipment options
			const equipment = Object.values(EQUIPMENT);
			const filtered = equipment
				.filter(eq => eq.name.toLowerCase().includes(focusedValue.toLowerCase()))
				.slice(0, 25)
				.map(eq => ({
					name: eq.name,
					value: eq.name
				}));

			return interaction.respond(filtered);
		}

		if (focusedOption.name === 'character') {
			// Return character options
			const characters = Object.values(STARTER_CHARACTERS);
			const filtered = characters
				.filter(char => char.name.toLowerCase().includes(focusedValue.toLowerCase()))
				.slice(0, 25)
				.map(char => ({
					name: char.name,
					value: char.name
				}));

			return interaction.respond(filtered);
		}

		return interaction.respond([]);
	}
}