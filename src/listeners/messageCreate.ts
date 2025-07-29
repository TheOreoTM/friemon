import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Message, TextChannel } from 'discord.js';
import { CharacterSpawningService } from '../lib/services/CharacterSpawningService';

@ApplyOptions<Listener.Options>({
	event: 'messageCreate'
})
export class MessageCreateListener extends Listener {
	private spawningService = CharacterSpawningService.getInstance();

	public override async run(message: Message) {
		// Ignore bot messages and DMs
		if (message.author.bot || !message.guild || !message.channel) {
			return;
		}

		// Only handle text channels
		if (!message.channel.isTextBased() || message.channel.isDMBased()) {
			return;
		}

		// Ensure it's a TextChannel for the spawning service
		if (!(message.channel instanceof TextChannel)) {
			return;
		}

		// Handle character spawning
		try {
			await this.spawningService.handleMessage(message.channel.id, message.channel);
		} catch (error) {
			this.container.logger.error('Error in character spawning:', error);
		}
	}
}