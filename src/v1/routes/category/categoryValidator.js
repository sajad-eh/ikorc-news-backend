import Joi from "joi";

export default new (class CategoryValidator {
  bodyCreateCategory() {
    const schema = Joi.object().keys({
      title: Joi.string().required(),
    });
    return schema;
  }

  paramsCheckId() {
    const schema = Joi.object().keys({
      id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    });
    return schema;
  }

  bodyUpdateCategoryById() {
    const schema = Joi.object().keys({
      title: Joi.string().required(),
    });
    return schema;
  }
})();
