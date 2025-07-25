import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { STARTER_CHARACTERS, CHARACTER_TIERS } from '../../lib/data/Characters';
import { EQUIPMENT } from '../../lib/data/Equipment';

@ApplyOptions<Command.Options>({
	description: 'Shop for characters, equipment, and items'
})
export class ShopCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('shop')
				.setDescription('Browse and purchase items')
				.addSubcommand((subcommand) => subcommand.setName('characters').setDescription('Browse available characters'))
				.addSubcommand((subcommand) => subcommand.setName('equipment').setDescription('Browse available equipment'))
				.addSubcommand((subcommand) => subcommand.setName('featured').setDescription('View featured items'))
				.addSubcommand((subcommand) =>
					subcommand
						.setName('buy')
						.setDescription('Purchase an item')
						.addStringOption((option) =>
							option.setName('item').setDescription('Item to purchase').setRequired(true).setAutocomplete(true)
						)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case 'characters':
				return this.handleCharacters(interaction);
			case 'equipment':
				return this.handleEquipment(interaction);
			case 'featured':
				return this.handleFeatured(interaction);
			case 'buy':
				return this.handleBuy(interaction);
			default:
				return interaction.reply({ content: 'Invalid subcommand!', ephemeral: true });
		}
	}

	private async handleCharacters(interaction: Command.ChatInputCommandInteraction) {
		const characters = Object.entries(STARTER_CHARACTERS);

		// Group characters by tier for pricing
		const tierPrices = {
			Common: 100,
			Uncommon: 250,
			Rare: 500,
			Epic: 1000,
			Legendary: 2500
		};

		const embed = new EmbedBuilder()
			.setTitle('🏪 Character Shop')
			.setColor(0x2ecc71)
			.setDescription('Purchase new characters to expand your roster!');

		// Show characters by tier
		Object.entries(tierPrices).forEach(([tier, price]) => {
			const tierChars = characters.filter(([id, _]) => CHARACTER_TIERS[id] === tier);

			if (tierChars.length > 0) {
				const charList = tierChars.map(([_, char]) => `• ${char.name} (Lv.${char.level})`).join('\n');

				embed.addFields({
					name: `${tier} - ${price} coins`,
					value: charList || 'None available',
					inline: true
				});
			}
		});

		embed.setFooter({ text: 'Use /shop buy <character> to purchase!' });

		return interaction.reply({ embeds: [embed] });
	}

	private async handleEquipment(interaction: Command.ChatInputCommandInteraction) {
		const equipment = Object.values(EQUIPMENT);

		// Simple pricing based on equipment power
		const getEquipmentPrice = (equipName: string): number => {
			const powerfulItems = ['staffOfJudgement', 'axeOfTheHero', 'lifeOrb', 'titanGauntlets'];
			const moderateItems = ['manaCrystal', 'barrierRing', 'swiftBoots', 'arcaneOrb'];

			if (powerfulItems.some((item) => equipName.toLowerCase().includes(item.toLowerCase()))) {
				return 800;
			} else if (moderateItems.some((item) => equipName.toLowerCase().includes(item.toLowerCase()))) {
				return 400;
			}
			return 200;
		};

		const embed = new EmbedBuilder().setTitle('⚔️ Equipment Shop').setColor(0x9b59b6).setDescription('Equip your characters with powerful gear!');

		// Group equipment by price range
		const priceRanges = {
			'Premium (800+ coins)': equipment.filter((eq) => getEquipmentPrice(eq.name) >= 800),
			'Standard (400-799 coins)': equipment.filter((eq) => {
				const price = getEquipmentPrice(eq.name);
				return price >= 400 && price < 800;
			}),
			'Basic (under 400 coins)': equipment.filter((eq) => getEquipmentPrice(eq.name) < 400)
		};

		Object.entries(priceRanges).forEach(([range, items]) => {
			if (items.length > 0) {
				const itemList = items
					.slice(0, 5) // Limit to 5 items per category
					.map((eq) => `• ${eq.name}`)
					.join('\n');

				embed.addFields({
					name: range,
					value: itemList + (items.length > 5 ? '\n*...and more*' : ''),
					inline: true
				});
			}
		});

		embed.setFooter({ text: 'Use /shop buy <equipment> to purchase!' });

		return interaction.reply({ embeds: [embed] });
	}

	private async handleFeatured(interaction: Command.ChatInputCommandInteraction) {
		// Featured items rotation (could be dynamic)
		const featuredCharacter = STARTER_CHARACTERS.frieren;
		const featuredEquipment = EQUIPMENT.staffOfJudgement;

		const embed = new EmbedBuilder()
			.setTitle('✨ Featured Items')
			.setColor(0xf39c12)
			.setDescription('Special deals and featured items!')
			.addFields(
				{
					name: '🌟 Featured Character',
					value: [
						`**${featuredCharacter.name}** (Level ${featuredCharacter.level})`,
						`*${featuredCharacter.races.join('/')} Character*`,
						'',
						'**Special Price:** ~~1000~~ **750 coins** (-25% OFF!)',
						'*Limited time offer!*'
					].join('\n'),
					inline: true
				},
				{
					name: '⚔️ Featured Equipment',
					value: [
						`**${featuredEquipment.name}**`,
						`*${featuredEquipment.description}*`,
						'',
						'**Special Price:** ~~800~~ **600 coins** (-25% OFF!)',
						'*Perfect for magical characters!*'
					].join('\n'),
					inline: true
				},
				{
					name: '🎁 Daily Bonus',
					value: ['**First purchase today:**', '• +50 bonus coins', '• Free random technique scroll', '• 2x XP for 24 hours'].join('\n'),
					inline: false
				}
			)
			.setFooter({ text: 'Featured items refresh daily!' });

		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('buy_featured_character').setLabel('Buy Featured Character').setStyle(ButtonStyle.Success),
			new ButtonBuilder().setCustomId('buy_featured_equipment').setLabel('Buy Featured Equipment').setStyle(ButtonStyle.Primary)
		);

		return interaction.reply({
			embeds: [embed],
			components: [actionRow]
		});
	}

	private async handleBuy(interaction: Command.ChatInputCommandInteraction) {
		const itemName = interaction.options.getString('item', true);

		// TODO: Check user's currency from database
		const userCurrency = 1000; // Default starting currency

		// Check if item is a character
		const character = Object.values(STARTER_CHARACTERS).find((char) => char.name.toLowerCase() === itemName.toLowerCase());

		if (character) {
			const characterId = Object.keys(STARTER_CHARACTERS).find((id) => STARTER_CHARACTERS[id].name === character.name);
			const tier = CHARACTER_TIERS[characterId!] || 'Common';
			const price = this.getCharacterPrice(tier);

			if (userCurrency < price) {
				return interaction.reply({
					content: `❌ Insufficient funds! You need **${price}** coins but only have **${userCurrency}**.`,
					ephemeral: true
				});
			}

			const embed = new EmbedBuilder()
				.setTitle('✅ Purchase Successful!')
				.setColor(0x2ecc71)
				.setDescription(`You have successfully purchased **${character.name}**!`)
				.addFields(
					{
						name: '💰 Transaction Details',
						value: [`**Cost:** ${price} coins`, `**Remaining Balance:** ${userCurrency - price} coins`].join('\n')
					},
					{
						name: '📊 Character Stats',
						value: [`**Level:** ${character.level}`, `**Races:** ${character.races.join(', ')}`, `**Tier:** ${tier}`].join('\n')
					}
				)
				.setFooter({ text: 'Character added to your collection!' });

			// TODO: Add character to user's database record

			return interaction.reply({ embeds: [embed] });
		}

		// Check if item is equipment
		const equipment = Object.values(EQUIPMENT).find((eq) => eq.name.toLowerCase() === itemName.toLowerCase());

		if (equipment) {
			const price = this.getEquipmentPrice(equipment.name);

			if (userCurrency < price) {
				return interaction.reply({
					content: `❌ Insufficient funds! You need **${price}** coins but only have **${userCurrency}**.`,
					ephemeral: true
				});
			}

			const embed = new EmbedBuilder()
				.setTitle('✅ Purchase Successful!')
				.setColor(0x2ecc71)
				.setDescription(`You have successfully purchased **${equipment.name}**!`)
				.addFields(
					{
						name: '💰 Transaction Details',
						value: [`**Cost:** ${price} coins`, `**Remaining Balance:** ${userCurrency - price} coins`].join('\n')
					},
					{
						name: '📝 Equipment Details',
						value: equipment.description
					}
				)
				.setFooter({ text: 'Equipment added to your inventory!' });

			// TODO: Add equipment to user's database record

			return interaction.reply({ embeds: [embed] });
		}

		return interaction.reply({
			content: `❌ Item "${itemName}" not found in the shop!`,
			ephemeral: true
		});
	}

	private getCharacterPrice(tier: string): number {
		const prices = {
			Common: 100,
			Uncommon: 250,
			Rare: 500,
			Epic: 1000,
			Legendary: 2500
		};
		return prices[tier as keyof typeof prices] || 100;
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
		const focusedValue = interaction.options.getFocused();

		// Combine characters and equipment for autocomplete
		const characters = Object.values(STARTER_CHARACTERS).map((char) => ({
			name: char.name,
			value: char.name
		}));

		const equipment = Object.values(EQUIPMENT).map((eq) => ({
			name: eq.name,
			value: eq.name
		}));

		const allItems = [...characters, ...equipment];

		const filtered = allItems.filter((item) => item.name.toLowerCase().includes(focusedValue.toLowerCase())).slice(0, 25);

		return interaction.respond(filtered);
	}
}
