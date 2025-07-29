import { AllFlowsPrecondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';
import { container } from '@sapphire/framework';

export class UserPrecondition extends AllFlowsPrecondition {
	#message = 'You must register first! Please use `/start` to begin your journey and select a starter character.';

	public override async chatInputRun(interaction: CommandInteraction) {
		return await this.doRegistrationCheck(interaction.user.id);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return await this.doRegistrationCheck(interaction.user.id);
	}

	public override async messageRun(message: Message) {
		return await this.doRegistrationCheck(message.author.id);
	}

	private async doRegistrationCheck(userId: Snowflake) {
		try {
			const user = await container.db.user.findUnique({
				where: { id: userId },
				include: { characters: true }
			});

			// User exists and has at least one character (completed registration)
			if (user && user.characters.length > 0) {
				return this.ok();
			}

			// User doesn't exist or hasn't completed registration
			return this.error({ message: this.#message });
		} catch (error) {
			console.error('Error in RegistrationRequired precondition:', error);
			return this.error({ message: 'An error occurred while checking your registration status.' });
		}
	}
}
