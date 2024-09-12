"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUdpateUserByAdmin = void 0;
const joi_1 = __importDefault(require("joi"));
const validateUdpateUserByAdmin = (req, res, next) => {
    const userUpdateSchema = joi_1.default.object({
        name: joi_1.default.string().required(),
        email: joi_1.default.string().email().required(),
        role: joi_1.default.string().required(),
        currentPassword: joi_1.default.alternatives().conditional(joi_1.default.ref("currentPassword"), {
            is: joi_1.default.exist(),
            then: joi_1.default.string().required(),
            otherwise: joi_1.default.forbidden(),
        }),
        newPassword: joi_1.default.alternatives().conditional(joi_1.default.ref("newPassword"), {
            is: joi_1.default.exist(),
            then: joi_1.default.string()
                .min(6)
                .required()
                .error((err) => {
                err[0].message = "New password must be at least 6 characters long!";
                return err;
            }),
            otherwise: joi_1.default.forbidden(),
        }),
    });
    const { error } = userUpdateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateUdpateUserByAdmin = validateUdpateUserByAdmin;
