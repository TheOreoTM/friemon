import './lib/setup';

import { FriemonClient } from './lib/FriemonClient';

const client = new FriemonClient();

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('Logged in as ' + client.user?.tag);
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

void main();
