const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = {
    validateRegistration: (data) => {
        let errors = {};

        data.username = !isEmpty(data.name) ? data.name : "";
        data.password = !isEmpty(data.password) ? data.password : "";
        data.password2 = !isEmpty(data.password2) ? data.password2 : "";

        // username check
        if (Validator.isEmpty(data.username)) {
            errors.name = "Username field is required";
        }

        // Password checks
        if (Validator.isEmpty(data.password)) {
            errors.password = "Password field is required";
        }
        if (Validator.isEmpty(data.password2)) {
            errors.password2 = "Confirm Password field is required";
        }
        if (!Validator.isLength(data.password, { min: 8, max: 30 })) {
            errors.password =
                "Password must be at least 8 characters and a maximum of 30 characters long";
        }
        if (!Validator.equals(data.password, data.password2)) {
            errors.password2 = "Passwords must match";
        }

        return {
            errors,
            isValid: isEmpty(errors),
        };
    },

    validateLogin: (data) => {
        let errors = {};
        data.username = !isEmpty(data.username) ? data.username : "";
        data.password = !isEmpty(data.password) ? data.password : "";

        // Username checks
        if (Validator.isEmpty(data.username)) {
            errors.name = "Username is required";
        }

        // Password checks
        if (Validator.isEmpty(data.password)) {
            errors.password = "Password is required";
        }

        return {
            errors,
            isValid: isEmpty(errors),
        };
    },
};
