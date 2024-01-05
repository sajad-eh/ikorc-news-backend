import Joi from "joi";

export default new (class NewsValidator {
  bodyCreateNews() {
    const schema = Joi.object().keys({
      title: Joi.string().required(),
      description: Joi.string().required(),
      author: Joi.string(),
      assortment: Joi.string(),
    });
    return schema;
  }

  paramsCheckId() {
    const schema = Joi.object().keys({
      id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    });
    return schema;
  }

  bodyUpdateNewsById() {
    const schema = Joi.object().keys({
      title: Joi.string().required(),
      description: Joi.string().required(),
      author: Joi.string(),
      assortment: Joi.string(),
      newsDate: Joi.date(),
    });
    return schema;
  }
})();
