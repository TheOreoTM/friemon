import { Guild } from 'discord.js';
import { battleEvents } from '../BattleEventEmitter';
import { BattleManager, BattleSession } from '../BattleManager';

export class ChannelUpdateListener {
	constructor() {
		this.setupListeners();
	}

	private setupListeners(): void {
		battleEvents.onChannelsCreated(this.handleChannelsCreated.bind(this));
		battleEvents.onTurnComplete(this.handleTurnComplete.bind(this));
		battleEvents.onBattleCompleted(this.handleBattleCompleted.bind(this));
	}

	private async handleChannelsCreated(session: BattleSession, guild: Guild): Promise<void> {
		try {
			// Send initial messages to player channels
			await this.setupInitialMessages(session, guild);
		} catch (error) {
			console.error('Error setting up initial channel messages:', error);
		}
	}

	private async handleTurnComplete(session: BattleSession, guild: Guild): Promise<void> {
		try {
			// Update battle log channel
			await this.updateBattleLogChannel(session, guild);

			// Send new move selection messages for next turn
			await this.sendNextTurnMessages(session, guild);
		} catch (error) {
			console.error('Error updating channels after turn completion:', error);
		}
	}

	private async handleBattleCompleted(session: BattleSession, guild: Guild): Promise<void> {
		try {
			// Update battle log channel with final result
			await this.updateBattleLogChannel(session, guild);

			// Send completion messages to player channels
			await this.sendCompletionMessages(session, guild);

			// Clean up battle threads (archive private threads, lock main thread)
			await BattleManager.cleanupBattleThreads(session.id, guild);
		} catch (error) {
			console.error('Error updating channels after battle completion:', error);
		}
	}

	private async setupInitialMessages(session: BattleSession, guild: Guild): Promise<void> {
		const player1Channel = guild.channels.cache.get(session.player1ThreadId!);
		const player2Channel = guild.channels.cache.get(session.player2ThreadId!);
		const battleLogChannel = guild.channels.cache.get(session.battleLogThreadId!);

		if (player1Channel && player1Channel.isTextBased()) {
			const player1Embed = session.interface.createPlayerMoveEmbed(session.player1Id, session);
			const player1Menu = session.interface.createMoveSelectionMenu(true);

			await player1Channel.send({
				embeds: [player1Embed],
				components: [player1Menu]
			});
		}

		if (player2Channel && player2Channel.isTextBased()) {
			const player2Embed = session.interface.createPlayerMoveEmbed(session.player2Id, session);
			const player2Menu = session.interface.createMoveSelectionMenu(false);

			await player2Channel.send({
				embeds: [player2Embed],
				components: [player2Menu]
			});
		}

		if (battleLogChannel && battleLogChannel.isTextBased()) {
			const battleLogEmbed = session.interface.createBattleLogEmbed(session);
			await battleLogChannel.send({
				embeds: [battleLogEmbed]
			});
		}
	}

	private async updateBattleLogChannel(session: BattleSession, guild: Guild): Promise<void> {
		const battleLogChannel = guild.channels.cache.get(session.battleLogThreadId!);
		if (battleLogChannel && battleLogChannel.isTextBased()) {
			const battleLogEmbed = session.interface.createBattleLogEmbed(session);
			await battleLogChannel.send({
				embeds: [battleLogEmbed]
			});
		}
	}

	private async sendNextTurnMessages(session: BattleSession, guild: Guild): Promise<void> {
		const player1Channel = guild.channels.cache.get(session.player1ThreadId!);
		const player2Channel = guild.channels.cache.get(session.player2ThreadId!);

		if (player1Channel && player1Channel.isTextBased()) {
			const player1Embed = session.interface.createPlayerMoveEmbed(session.player1Id, session);
			const player1Menu = session.interface.createMoveSelectionMenu(true);

			await player1Channel.send({
				embeds: [player1Embed],
				components: [player1Menu]
			});
		}

		if (player2Channel && player2Channel.isTextBased()) {
			const player2Embed = session.interface.createPlayerMoveEmbed(session.player2Id, session);
			const player2Menu = session.interface.createMoveSelectionMenu(false);

			await player2Channel.send({
				embeds: [player2Embed],
				components: [player2Menu]
			});
		}
	}

	private async sendCompletionMessages(session: BattleSession, guild: Guild): Promise<void> {
		const player1Channel = guild.channels.cache.get(session.player1ThreadId!);
		const player2Channel = guild.channels.cache.get(session.player2ThreadId!);

		const resultEmbed = session.interface.createBattleResultEmbed();

		if (player1Channel && player1Channel.isTextBased()) {
			await player1Channel.send({
				content: '🏁 **Battle Complete!**',
				embeds: [resultEmbed]
			});
		}

		if (player2Channel && player2Channel.isTextBased()) {
			await player2Channel.send({
				content: '🏁 **Battle Complete!**',
				embeds: [resultEmbed]
			});
		}
	}
}
