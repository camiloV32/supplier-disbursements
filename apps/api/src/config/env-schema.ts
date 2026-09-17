import * as joi from 'joi';

export const envVarsSchema: joi.ObjectSchema = joi.object({
    NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
    PORT: joi.number(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required(),
    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_NAME: joi.string().required(),
    DB_LOGGING: joi.boolean().default(false),
    DB_SYNC: joi.boolean().default(false),
    JWT_SECRET: joi.string().required(),
    JWT_EXPIRES_IN: joi.string().default('8h'),
    CORS_ORIGIN: joi.string().required(),
})