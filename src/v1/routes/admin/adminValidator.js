import Joi from "joi";

export default new (class AdminValidator {
  paramsPublishNews() {
    const schema = Joi.object().keys({
      action: Joi.string().required().valid("enable", "disable"),
      newsId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    });
    return schema;
  }

  bodyVerifyOTAC() {
    const schema = Joi.object().keys({
      authorizationCode: Joi.string().regex(/^[0-9]{8}$/),
    });
    return schema;
  }
})();
