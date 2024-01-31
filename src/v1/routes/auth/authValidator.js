import Joi from "joi";

export default new (class AuthValidator {
  bodyRegisterValidator() {
    const schema = Joi.object().keys({
      firstName: Joi.string().alphanum().min(3, "utf-8").max(35, "utf-8").required(),
      lastName: Joi.string().alphanum().min(3, "utf-8").max(35, "utf-8").required(),
      email: Joi.string()
        .min(5, "utf-8")
        .max(60, "utf-8")
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
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

  paramsCheckId() {
    const schema = Joi.object().keys({
      userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    });
    return schema;
  }

  bodyVerifyOTP() {
    // TODO regex
    const schema = Joi.object().keys({
      verificationKey: Joi.number().integer().required(),
    });
    return schema;
  }

  bodyLoginValidator() {
    const schema = Joi.object({
      email: Joi.string()
        .min(5, "utf-8")
        .max(60, "utf-8")
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required(),
      password: Joi.string()
        .min(8, "utf-8")
        .max(60, "utf-8")
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
    });
    return schema;
  }

  bodyForgetPassword() {
    const schema = Joi.object().keys({
      email: Joi.string()
        .min(5, "utf-8")
        .max(60, "utf-8")
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required(),
    });
    return schema;
  }

  paramsCheckToken() {
    const schema = Joi.object().keys({
      token: Joi.string().token().required(),
    });
    return schema;
  }

  bodyResetPassword() {
    const schema = Joi.object().keys({
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
