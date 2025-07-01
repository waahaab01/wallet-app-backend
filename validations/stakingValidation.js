const Joi = require('joi');

exports.stakeSchema = Joi.object({
  amount: Joi.number().positive().required()
});

exports.createPlanSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('', null),
  durationDays: Joi.number().integer().positive().required(),
  rewardRate: Joi.number().positive().required()
});
