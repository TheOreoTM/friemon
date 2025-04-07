import '@sapphire/pieces';
import type { ArrayString } from '@skyra/env-utilities';

declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never;
	}
}

declare module '@skyra/env-utilities' {
	interface Env {
		OWNERS: ArrayString;
	}
}
