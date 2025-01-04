const Joi = require('joi');

/**
 * 
 * @param {{[key:string]:Joi.SchemaLike | Joi.SchemaLike[]}} schema 
 */
function validate(body, res, schema) {
    let joi = Joi.object(schema);
    let result = joi.validate(body, { allowUnknown: true });

    if (result.error) {
      res.status(400).json({error:result.error.message});  
      return false;
    }
    return true;
}

module.exports = validate;