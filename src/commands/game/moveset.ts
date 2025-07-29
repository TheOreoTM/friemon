import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } from 'discord.js';
import { CharacterRegistry } from '../../lib/characters/CharacterRegistry';
import { getCharacterTier } from '../../lib/data/Characters';

@ApplyOptions<Command.Options>({
    description: 'View character movesets using an interactive menu',
    preconditions: ['RegistrationRequired']
})
export class MovesetCommand extends Command {
    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('moveset')
                .setDescription('View character movesets with an interactive select menu')
        );
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<void> {
        const characters = CharacterRegistry.getAllCharacters();
        
        if (characters.length === 0) {
            await interaction.reply({
                content: '❌ No characters available!',
                ephemeral: true
            });
            return;
        }

        // Create select menu options
        const options = characters.map(char => {
            const displayInfo = char.getDisplayInfo();
            const tier = getCharacterTier(displayInfo.name);
            
            return new StringSelectMenuOptionBuilder()
                .setLabel(`${displayInfo.name}`)
                .setDescription(`${tier} • Level ${displayInfo.level} • ${displayInfo.races.join('/')}`)
                .setValue(char.characterName)
                .setEmoji(displayInfo.emoji);
        });

        // Split into multiple select menus if too many options (Discord limit is 25)
        const selectMenus: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
        const maxOptionsPerMenu = 25;

        for (let i = 0; i < options.length; i += maxOptionsPerMenu) {
            const chunk = options.slice(i, i + maxOptionsPerMenu);
            const menuNumber = Math.floor(i / maxOptionsPerMenu) + 1;
            const totalMenus = Math.ceil(options.length / maxOptionsPerMenu);
            
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`character_select_${menuNumber}`)
                .setPlaceholder(totalMenus > 1 ? `Choose a character (Page ${menuNumber}/${totalMenus})` : 'Choose a character to view their moveset')
                .addOptions(chunk);

            selectMenus.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu));
        }

        // Create initial embed
        const initialEmbed = new EmbedBuilder()
            .setTitle('🎮 Character Moveset Viewer')
            .setColor(0x3498db)
            .setDescription(
                `Select a character from the dropdown menu${selectMenus.length > 1 ? 's' : ''} below to view their detailed moveset and abilities.\n\n` +
                `📊 **${characters.length} Characters Available**\n` +
                `⚡ Each character has unique techniques and abilities\n` +
                `🎭 Characters have different rarities based on complexity\n\n` +
                `*Use this to plan your battle strategies and learn about character abilities!*`
            )
            .addFields(
                {
                    name: '📋 Character Tiers',
                    value: [
                        '🟤 **Common** - Simple mechanics',
                        '🟢 **Uncommon** - Moderate complexity', 
                        '🔵 **Rare** - Advanced interactions',
                        '🟣 **Epic** - High skill ceiling',
                        '🟡 **Legendary** - Master-level complexity'
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '💡 How to Use',
                    value: [
                        '1️⃣ Select a character from the menu',
                        '2️⃣ View their stats and abilities', 
                        '3️⃣ See all their techniques',
                        '4️⃣ Select another character anytime'
                    ].join('\n'),
                    inline: true
                }
            )
            .setFooter({ text: 'Menu will be active for 5 minutes' });

        // Send initial message with select menu(s)
        const response = await interaction.reply({
            embeds: [initialEmbed],
            components: selectMenus,
            fetchReply: true
        });

        // Create collector for select menu interactions
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 300_000 // 5 minutes
        });

        collector.on('collect', async (selectInteraction): Promise<void> => {
            // Check if the user who clicked is the same as who used the command
            if (selectInteraction.user.id !== interaction.user.id) {
                await selectInteraction.reply({
                    content: '❌ Only the person who used the command can interact with this menu!',
                    ephemeral: true
                });
                return;
            }

            const selectedCharacterName = selectInteraction.values[0];
            const selectedCharacter = characters.find(char => char.characterName === selectedCharacterName);

            if (!selectedCharacter) {
                await selectInteraction.reply({
                    content: '❌ Character not found!',
                    ephemeral: true
                });
                return;
            }

            // Create detailed character embed
            const characterEmbed = this.createCharacterEmbed(selectedCharacter);

            // Update the message with the character details
            await selectInteraction.update({
                embeds: [characterEmbed],
                components: selectMenus // Keep the select menus active
            });
        });

        collector.on('end', async () => {
            // Disable all select menus when collector expires
            const disabledComponents = selectMenus.map(row => {
                const newRow = new ActionRowBuilder<StringSelectMenuBuilder>();
                row.components.forEach(component => {
                    if (component instanceof StringSelectMenuBuilder) {
                        newRow.addComponents(component.setDisabled(true));
                    }
                });
                return newRow;
            });

            try {
                await response.edit({
                    embeds: [initialEmbed.setFooter({ text: 'This menu has expired. Use /moveset again to view characters.' })],
                    components: disabledComponents
                });
            } catch (error) {
                // Message might have been deleted, ignore error
                console.warn('Could not disable moveset menu components:', error);
            }
        });
    }

    private createCharacterEmbed(character: any) {
        const displayInfo = character.getDisplayInfo();
        const tier = getCharacterTier(displayInfo.name);
        const tierColor = this.getTierColor(tier);

        const embed = new EmbedBuilder()
            .setTitle(`${displayInfo.emoji} ${displayInfo.name}`)
            .setColor(tierColor)
            .setDescription(displayInfo.description || 'A skilled fighter ready for battle');

        // Basic info
        embed.addFields({
            name: '📊 Character Info',
            value: [
                `**Tier:** ${tier}`,
                `**Level:** ${displayInfo.level}`,
                `**Races:** ${displayInfo.races.join(', ')}`,
                `**Total Stats:** ${displayInfo.statTotal}`
            ].join('\n'),
            inline: true
        });

        // Base stats
        embed.addFields({
            name: '⚡ Base Stats',
            value: [
                `❤️ **HP:** ${character.baseStats.hp}`,
                `⚔️ **Attack:** ${character.baseStats.attack}`,
                `🛡️ **Defense:** ${character.baseStats.defense}`,
                `🔮 **Magic Attack:** ${character.baseStats.magicAttack}`,
                `✨ **Magic Defense:** ${character.baseStats.magicDefense}`,
                `💨 **Speed:** ${character.baseStats.speed}`
            ].join('\n'),
            inline: true
        });

        // Character ability
        embed.addFields({
            name: '🎭 Signature Ability',
            value: `**${displayInfo.ability}**\n${displayInfo.abilityDescription}`,
            inline: false
        });

        // Sub-abilities if they exist
        if (displayInfo.subAbilities && displayInfo.subAbilities.length > 0) {
            const subAbilityText = displayInfo.subAbilities
                .map((sub: any) => `• **${sub.name}:** ${sub.description}`)
                .join('\n');
            
            embed.addFields({
                name: '🔗 Sub-Abilities',
                value: subAbilityText,
                inline: false
            });
        }

        // Techniques/Moveset
        if (character.techniques && character.techniques.length > 0) {
            const techniqueGroups = this.groupTechniquesByCategory(character.techniques);
            
            Object.entries(techniqueGroups).forEach(([category, techniques]) => {
                const techniqueList = techniques.map(tech => {
                    const affinityEmoji = this.getAffinityEmoji(tech.affinity);
                    const powerText = tech.power > 0 ? ` • ${tech.power} Power` : '';
                    return `${affinityEmoji} **${tech.name}** (${tech.manaCost} MP${powerText})\n*${tech.description}*`;
                }).join('\n\n');

                embed.addFields({
                    name: `⚔️ ${category} Techniques`,
                    value: techniqueList.length > 1024 ? techniqueList.substring(0, 1020) + '...' : techniqueList,
                    inline: false
                });
            });
        } else {
            embed.addFields({
                name: '⚔️ Techniques',
                value: 'No techniques available',
                inline: false
            });
        }


        embed.setFooter({ text: `Select another character from the menu above to compare movesets` });

        return embed;
    }

    private groupTechniquesByCategory(techniques: any[]) {
        const groups: { [key: string]: any[] } = {};
        
        techniques.forEach(tech => {
            const category = tech.category || 'Other';
            if (!groups[category]) groups[category] = [];
            groups[category].push(tech);
        });

        return groups;
    }

    private getAffinityEmoji(affinity: string): string {
        const affinityEmojis: { [key: string]: string } = {
            'Destruction': '💥',
            'Support': '🛡️',
            'Defense': '🏰',
            'Healing': '💚',
            'Illusion': '🌙',
            'Elemental_Fire': '🔥',
            'Elemental_Water': '💧',
            'Elemental_Wind': '💨',
            'Elemental_Earth': '🌍',
            'Demonic_Aura': '👹'
        };
        return affinityEmojis[affinity] || '⚡';
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
}