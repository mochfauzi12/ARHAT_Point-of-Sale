import { AppError } from '../lib/errors';
export const errorHandler = (err, ctx) => {
    if (err instanceof AppError) {
        return ctx.json({ error: err.message }, err.statusCode);
    }
    console.error(err);
    return ctx.json({ error: 'Internal Server Error' }, 500);
};
