import Joi from "joi";

export default new (class NewsValidator {
  bodyCreateNews() {
    const schema = Joi.object().keys({
      title: Joi.string().required().messages({ "any.required": " عنوان خبر الزامی می باشد" }),
      description: Joi.string().required().messages({ "any.required": " توضیحات خبر الزامی می باشد" }),
      author: Joi.string(),
      newsDate: Joi.date(),
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
      title: Joi.string().required().messages({ "any.required": " عنوان خبر الزامی می باشد" }),
      description: Joi.string().required().messages({ "any.required": " توضیحات خبر الزامی می باشد" }),
      author: Joi.string().required().messages({ "any.required": " نویسنده الزامی می باشد" }),
      newsDate: Joi.date().required().messages({ "any.required": " تاریخ خبر الزامی می باشد" }),
    });
    return schema;
  }
})();
