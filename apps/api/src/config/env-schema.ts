import * as joi from 'joi';




export const envVarsSchema: joi.ObjectSchema = joi.object({
    PORT: joi.number()
})