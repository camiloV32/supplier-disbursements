import * as joi from 'joi';

export const envVarsSchema: joi.ObjectSchema = joi.object({
    PORT: joi.number(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required(),
    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_NAME: joi.string().required(),
})