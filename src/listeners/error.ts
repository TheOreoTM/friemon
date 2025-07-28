import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
    event: Events.ClientReady
})
export class ErrorListener extends Listener {
    public override run() {
        process.on('unhandledRejection', (reason, promise) => {
            this.container.logger.warn('[antiCrash] :: Unhandled Rejection/Catch');
            this.container.logger.error('Unhandled Rejection at:', promise);
            this.container.logger.error('Reason:', reason);
        });

        process.on('uncaughtException', (error, origin) => {
            this.container.logger.warn('[antiCrash] :: Uncaught Exception/Catch');
            this.container.logger.error('Uncaught Exception at:', origin);
            this.container.logger.error('Error:', error);
        });

        process.on('uncaughtExceptionMonitor', (error, origin) => {
            this.container.logger.warn('[antiCrash] :: Uncaught Exception/Catch (MONITOR)');
            this.container.logger.error('Uncaught Exception Monitor at:', origin);
            this.container.logger.error('Error:', error);
        });

        process.on('warning', (warning) => {
            this.container.logger.warn('[antiCrash] :: Process Warning');
            this.container.logger.warn('Warning Name:', warning.name);
            this.container.logger.warn('Warning Message:', warning.message);
            this.container.logger.warn('Stack Trace:', warning.stack);
        });

        // Handle Discord.js specific errors
        this.container.client.on('error', (error) => {
            this.container.logger.error('[Discord] :: Client Error:', error);
        });

        this.container.client.on('warn', (warning) => {
            this.container.logger.warn('[Discord] :: Client Warning:', warning);
        });

        this.container.logger.info('[antiCrash] :: Error handlers initialized successfully');
    }
}