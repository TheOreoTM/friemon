import { ThreadChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild, ChannelType } from 'discord.js';
import { BattleSession } from './BattleManager';
import { GAME_CHANNEL_ID, BATTLE_CONSTANTS } from '../util/constants';

export class BattleChannel {
	private thread: ThreadChannel;
	private session: BattleSession;

	constructor(thread: ThreadChannel, session: BattleSession) {
		this.thread = thread;
		this.session = session;
	}

	public static async create(session: BattleSession, guild: Guild): Promise<BattleChannel> {
		const parentChannel = guild.channels.cache.get(GAME_CHANNEL_ID!);
		if (!parentChannel || parentChannel.type !== ChannelType.GuildText) {
			throw new Error('Invalid parent channel for battle thread');
		}

		const battleId = session.id.split('_')[0];
		const thread = await parentChannel.threads.create({
			name: `⚔️ ${session.user.username} vs ${session.opponent.username}`,
			autoArchiveDuration: BATTLE_CONSTANTS.THREAD_AUTO_ARCHIVE_DURATION,
			type: ChannelType.PublicThread,
			reason: `Battle ${battleId}`
		});

		// Add both players to thread
		await thread.members.add(session.user.id);
		await thread.members.add(session.opponent.id);

		const battleChannel = new BattleChannel(thread, session);
		await battleChannel.sendInitialMessage();

		return battleChannel;
	}

	public async sendActionMessage(message: string): Promise<void> {
		try {
			await this.thread.send(message);
		} catch (error) {
			console.error('Error sending action message:', error);
		}
	}

	private async sendInitialMessage(): Promise<void> {
		const embed = this.session.interface.createBattleStatusEmbed(this.session);
		const actionButtons = this.createActionButtons();

		await this.thread.send({
			content: `⚔️ **Battle Started!**\n${this.session.user} vs ${this.session.opponent}`,
			embeds: [embed],
			components: [actionButtons]
		});
	}

	public async sendTurnStart(): Promise<void> {
		const embed = this.session.interface.createBattleStatusEmbed(this.session);
		const actionButtons = this.createActionButtons();

		await this.thread.send({
			content: `🎯 **Turn ${this.session.currentTurn}** - Choose your actions!`,
			embeds: [embed],
			components: [actionButtons]
		});
	}

	public async sendPlayerReady(playerId: string): Promise<void> {
		const playerName = playerId === this.session.user.id ? this.session.user.displayName : this.session.opponent.displayName;
		const otherPlayerId = playerId === this.session.user.id ? this.session.opponent.id : this.session.user.id;
		const otherReady = this.session.playerActions.get(otherPlayerId);

		if (otherReady) {
			await this.thread.send(`✅ **Both players ready!** Processing turn...`);
		} else {
			await this.thread.send(`✅ **${playerName}** has selected their action. Waiting for opponent...`);
		}
	}

	public async sendTurnResults(messages: string[]): Promise<void> {
		for (const message of messages) {
			await this.thread.send(message);
		}
	}

	public async sendBattleComplete(): Promise<void> {
		const resultEmbed = this.session.interface.createBattleResultEmbed(this.session);
		await this.thread.send({
			content: '🏆 **Battle Complete!**',
			embeds: [resultEmbed],
			components: [] // Remove all buttons
		});

		// Archive thread after a delay
		setTimeout(async () => {
			try {
				await this.thread.setArchived(true, 'Battle completed');
			} catch (error) {
				console.error('Error archiving battle thread:', error);
			}
		}, 30000); // 30 seconds
	}

	private createActionButtons(): ActionRowBuilder<ButtonBuilder> {
		const player1Button = new ButtonBuilder()
			.setCustomId(`make_action_${this.session.user.id}`)
			.setLabel(`${this.session.user.displayName} - Make Action`)
			.setStyle(ButtonStyle.Primary)
			.setEmoji('⚔️')
			.setDisabled(!!this.session.playerActions.get(this.session.user.id));

		const player2Button = new ButtonBuilder()
			.setCustomId(`make_action_${this.session.opponent.id}`)
			.setLabel(`${this.session.opponent.displayName} - Make Action`)
			.setStyle(ButtonStyle.Primary)
			.setEmoji('⚔️')
			.setDisabled(!!this.session.playerActions.get(this.session.opponent.id));

		return new ActionRowBuilder<ButtonBuilder>().addComponents(player1Button, player2Button);
	}

	public getThread(): ThreadChannel {
		return this.thread;
	}
}
