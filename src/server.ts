import cors from 'cors';
import express, {
    Express, NextFunction, Request, RequestHandler, Response,
} from 'express';

import routes from './routes';

import { ServerConfiguration } from './server.types';

/**
 * Wrapper that handles the call of every route and passes next if error occurs
 * This elimates the need for try catch in every single route
 * @param routeHandler callback function
 */
// eslint-disable-next-line max-len
const apiWrapper = (handler: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req, res, next)).catch((err) => next(err));

const server = async ({ config }: { config: ServerConfiguration }) => {
    try {
        const { port } = config;

        const app: Express = express();
        app.use(cors());

        app.use(express.json());
        app.use(
            express.urlencoded({
                extended: true,
            }),
        );
        app.post('/saveForm', apiWrapper(routes.saveform.default));
        app.post('/searchNumbers', apiWrapper(routes.numbers.default));

        await app.listen(config.port);
        return { port };
    } catch (e) {
        return false;
    }
};

export default server;
