import type { Snowflake } from 'discord.js';
import { container } from '@sapphire/framework';

/**
 * @param id The id of the user to get
 * Gets an existing user or creates and returns the new user object
 */
export async function getUser(id: Snowflake) {
	const user = await container.db.user.upsert({
		where: {
			id
		},
		create: {
			id
		},
		update: {}
	});

	return user;
}

