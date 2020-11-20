const Validator = require("validator");
const isEmpty = require("is-empty");
const { emptyStringIfUndef } = require("./util");

module.exports = {
    /**
     * Validates registration form data
     * @param {Object} data - Registration fields
     * @return {Object} An object with boolean isValid, and errors if any
     */
    validateRegistration: (data) => {
        let errors = {};

        data.username = emptyStringIfUndef(data.username);
        data.password = emptyStringIfUndef(data.password);
        data.password2 = emptyStringIfUndef(data.password2);
        data.type = emptyStringIfUndef(data.type);
        data.stageId = emptyStringIfUndef(data.stageId);

        // username check
        if (Validator.isEmpty(data.username)) {
            errors.username = "Username field is required";
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

        // Type check
        if(Validator.isEmpty(data.type)) {
            errors.type = "Type field is required";
        } else {
            if(data.type === "stage") {
                if(Validator.isEmpty(data.stageId)) {
                    errors.stageId = "Stage ID is required";
                }
            } else if(data.type === "admin") {
                errors.type = "Feature not implemented yet";
            } else {
                errors.type = "Invalid type";
            }
        }

        return {
            errors,
            isValid: isEmpty(errors),
        };
    },

    /**
     * Validates login form data
     * @param {Object} data - Login fields
     * @returns {Object} An object with boolean isValid, and errors if any
     */
    validateLogin: (data) => {
        let errors = {};
        data.username = emptyStringIfUndef(data.username);
        data.password = emptyStringIfUndef(data.password);

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
