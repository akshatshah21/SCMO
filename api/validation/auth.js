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
        // TODO: Check if a user with the same username exists

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

        // TODO
        // Check if the stage that this user is claiming to be in-charge of has any other user already assigned. If yes, add an errors.other.

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

        // TODO
        // check if username exists in the database, use getUserByUsername() helper from "./neo4j-db/users";
        // if no user, add error
        // if username exists, check password using bcrypt
        // if password doesn't match, add error

        return {
            errors,
            isValid: isEmpty(errors),
        };
    },
};
