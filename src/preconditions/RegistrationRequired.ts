import { AllFlowsPrecondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';

export class UserPrecondition extends AllFlowsPrecondition {
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
		const user = await this.container.db.user.findUnique({ where: { id: userId } });
		if (!user) {
			await this.container.db.user.create({ data: { id: userId } });
		}
		return this.ok();
	}
}
