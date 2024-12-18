import Joi from "joi";

export default new (class NewsValidator {
  bodyCreateNews() {
    const schema = Joi.object().keys({
      title: Joi.string().required(),
      description: Joi.string().required(),
      author: Joi.string().required(),
      newsDate: Joi.date(),
      category: Joi.string().required(),
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
      author: Joi.string().required(),
      newsDate: Joi.date(),
      category: Joi.string().required(),
    });
    return schema;
  }

  paramsCheckNewsId() {
    const schema = Joi.object().keys({
      newsId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    });
    return schema;
  }
})();
