import type { Snowflake } from 'discord.js';
import { container } from '@sapphire/framework';

/**
 * @param id The id of the user to get
 * @param username The username of the user (required for new users)
 * Gets an existing user or creates and returns the new user object
 */
export async function getUser(id: Snowflake, username?: string) {
	const user = await container.db.user.upsert({
		where: {
			id
		},
		create: {
			id,
			username: username || 'Unknown User'
		},
		update: {}
	});

	return user;
}

