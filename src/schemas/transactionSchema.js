import Joi from "joi";

export const transactionSchema = Joi.object({
    value: Joi.number().positive().required(),
    description: Joi.string().required(),
    type: Joi.any().valid('income', 'outcome').required()
});