import { Guild, Client } from 'discord.js';
import { battleEvents } from '../BattleEventEmitter';
import { BattleManager, BattleSession } from '../BattleManager';

export class ChannelUpdateListener {
	private client?: Client;

	constructor(client?: Client) {
		this.client = client;
		this.setupListeners();
	}

	private setupListeners(): void {
		battleEvents.onChannelsCreated(this.handleChannelsCreated.bind(this));
		battleEvents.onTurnComplete(this.handleTurnComplete.bind(this));
		battleEvents.onBattleCompleted(this.handleBattleCompleted.bind(this));
		battleEvents.onActionMessage(this.handleActionMessage.bind(this));
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
			// Send turn results message
			const battleLogChannel = guild.channels.cache.get(session.battleLogThread!);
			if (battleLogChannel && battleLogChannel.isTextBased()) {
				const turnMessage = `**Turn ${session.currentTurn} complete.**`;
				await battleLogChannel.send(turnMessage);

				// Send character stats embeds for both players
				const [player1Embed, player2Embed] = session.interface.createBothPlayerStatsEmbeds(session);
				await battleLogChannel.send({ embeds: [player1Embed] });
				await battleLogChannel.send({ embeds: [player2Embed] });
			}

			// Send comprehensive team embeds to private threads
			await this.sendPrivateThreadUpdates(session, guild);

			// Send new move selection messages for next turn (if battle not complete)
			if (!session.battle.isComplete()) {
				await this.sendNextTurnMessages(session, guild);
			}
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

	private async handleActionMessage(sessionId: string, message: string): Promise<void> {
		try {
			// Find the active battle session
			const session = BattleManager.getSessionById(sessionId);
			if (!session) {
				console.error('Session not found for action message:', sessionId);
				return;
			}

			// Get guild from the first available channel
			const guild = await this.getGuildFromSession(session);
			if (!guild) {
				console.error('Guild not found for session:', sessionId);
				return;
			}

			// Send message to battle log channel
			const battleLogChannel = guild.channels.cache.get(session.battleLogThread!);
			if (battleLogChannel && battleLogChannel.isTextBased()) {
				await battleLogChannel.send(message);
			}
		} catch (error) {
			console.error('Error sending action message:', error);
		}
	}

	private async getGuildFromSession(session: BattleSession): Promise<Guild | null> {
		try {
			// Try to get guild from any available channel
			if (session.battleLogThread) {
				const channel = await this.client?.channels.fetch(session.battleLogThread);
				if (channel && 'guild' in channel) {
					return channel.guild;
				}
			}
			if (session.player1Thread) {
				const channel = await this.client?.channels.fetch(session.player1Thread);
				if (channel && 'guild' in channel) {
					return channel.guild;
				}
			}
			return null;
		} catch (error) {
			console.error('Error getting guild from session:', error);
			return null;
		}
	}

	private async sendPrivateThreadUpdates(session: BattleSession, guild: Guild): Promise<void> {
		const player1Channel = guild.channels.cache.get(session.player1Thread!);
		const player2Channel = guild.channels.cache.get(session.player2Thread!);

		if (player1Channel && player1Channel.isTextBased()) {
			const player1TeamEmbed = session.interface.createPlayerCharacterStatsEmbed(session.user.id, session);
			await player1Channel.send({
				content: `**Turn ${session.currentTurn} Results**`,
				embeds: [player1TeamEmbed]
			});
		}

		if (player2Channel && player2Channel.isTextBased()) {
			const player2TeamEmbed = session.interface.createPlayerCharacterStatsEmbed(session.opponent.id, session);
			await player2Channel.send({
				content: `**Turn ${session.currentTurn} Results**`,
				embeds: [player2TeamEmbed]
			});
		}
	}

	private async setupInitialMessages(session: BattleSession, guild: Guild): Promise<void> {
		const player1Channel = guild.channels.cache.get(session.player1Thread!);
		const player2Channel = guild.channels.cache.get(session.player2Thread!);
		const battleLogChannel = guild.channels.cache.get(session.battleLogThread!);

		if (player1Channel && player1Channel.isTextBased()) {
			const player1Embed = session.interface.createPlayerMoveEmbed(session.user.id, session);
			const player1Menu = session.interface.createMoveSelectionMenu(true);
			const player1SwitchButtons = session.interface.createTeamSwitchButtons(session.user.id, session);
			const forfeitButton = session.interface.createForfeitButton();

			await player1Channel.send({
				embeds: [player1Embed],
				components: [player1Menu, player1SwitchButtons, forfeitButton]
			});
		}

		if (player2Channel && player2Channel.isTextBased()) {
			const player2Embed = session.interface.createPlayerMoveEmbed(session.opponent.id, session);
			const player2Menu = session.interface.createMoveSelectionMenu(false);
			const player2SwitchButtons = session.interface.createTeamSwitchButtons(session.opponent.id, session);
			const forfeitButton = session.interface.createForfeitButton();

			await player2Channel.send({
				embeds: [player2Embed],
				components: [player2Menu, player2SwitchButtons, forfeitButton]
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
		const battleLogChannel = guild.channels.cache.get(session.battleLogThread!);
		if (battleLogChannel && battleLogChannel.isTextBased()) {
			const battleLogEmbed = session.interface.createBattleLogEmbed(session);
			await battleLogChannel.send({
				embeds: [battleLogEmbed]
			});
		}
	}

	private async sendNextTurnMessages(session: BattleSession, guild: Guild): Promise<void> {
		const player1Channel = guild.channels.cache.get(session.player1Thread!);
		const player2Channel = guild.channels.cache.get(session.player2Thread!);

		if (player1Channel && player1Channel.isTextBased()) {
			const player1Embed = session.interface.createPlayerMoveEmbed(session.user.id, session);
			const player1Menu = session.interface.createMoveSelectionMenu(true);
			const player1SwitchButtons = session.interface.createTeamSwitchButtons(session.user.id, session);
			const forfeitButton = session.interface.createForfeitButton();

			await player1Channel.send({
				embeds: [player1Embed],
				components: [player1Menu, player1SwitchButtons, forfeitButton]
			});
		}

		if (player2Channel && player2Channel.isTextBased()) {
			const player2Embed = session.interface.createPlayerMoveEmbed(session.opponent.id, session);
			const player2Menu = session.interface.createMoveSelectionMenu(false);
			const player2SwitchButtons = session.interface.createTeamSwitchButtons(session.opponent.id, session);
			const forfeitButton = session.interface.createForfeitButton();

			await player2Channel.send({
				embeds: [player2Embed],
				components: [player2Menu, player2SwitchButtons, forfeitButton]
			});
		}
	}

	private async sendCompletionMessages(session: BattleSession, guild: Guild): Promise<void> {
		const player1Channel = guild.channels.cache.get(session.player1Thread!);
		const player2Channel = guild.channels.cache.get(session.player2Thread!);

		const resultEmbed = session.interface.createBattleResultEmbed(session);

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
