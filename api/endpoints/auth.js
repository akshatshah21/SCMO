const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_OR_KEY } = require("../config/keys");

router.post("/register", (req, res) => {
    const { errors, isValid } = validateRegistration(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }

    // TODO
    // Add user by calling addUser() helper in "../neo4j-db/user". Also attach stage (do this in addUser() itself
});

router.post("/login", (req, res) => {
    const { errors, isValid } = validateLogin(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    // Finding user, matching password is handled by validateLogin

    // Sign token
    // payload is the user identity payload
    jwt.sign(payload, SECRET_OR_KEY, { expiresIn: 31556926 }, (err, token) => {
        res.json({
            success: true,
            token: "Bearer " + token,
        });
    });
});

modules.exports = router;
