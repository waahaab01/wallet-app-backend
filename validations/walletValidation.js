const Joi = require('joi');

exports.sendSchema = Joi.object({
  toAddress: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .required()
    .messages({ 'string.pattern.base': 'Invalid Ethereum address' }),

  amountEth: Joi.number().positive().required()
});
