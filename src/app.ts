import * as dotenv from 'dotenv';

import server from './server';
import { ServerConfiguration } from './server.types';
import logger from './utils/log';

dotenv.config();

const config: ServerConfiguration = {
    port: parseInt(`${process.env.PORT}`, 10) ?? 3080,
};

const start = async (): Promise<void> => {
    try {
        await server({ config });
        logger.info(`Server started on port ${config.port}`);
    } catch (err) {
        logger.error('Server failed to start', err);
    }
};

start();
