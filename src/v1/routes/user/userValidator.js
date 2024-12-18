import Joi from "joi";

export default new (class AuthValidator {
  bodyUpdateUser() {
    const schema = Joi.object().keys({
      firstName: Joi.string().alphanum().min(3, "utf-8").max(35, "utf-8").required(),
      lastName: Joi.string().alphanum().min(3, "utf-8").max(35, "utf-8").required(),
    });
    return schema;
  }

  bodyUpdatePassword() {
    const schema = Joi.object().keys({
      currentPassword: Joi.string()
        .min(8, "utf-8")
        .max(60, "utf-8")
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      password: Joi.string()
        .min(8, "utf-8")
        .max(60, "utf-8")
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      repeatPassword: Joi.any().valid(Joi.ref("password")).required(),
    });
    return schema;
  }
})();
