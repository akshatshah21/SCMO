const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_OR_KEY } = require("../config/keys");
const { addUser, getUserByUsername } = require("../neo4j-db/user");

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegistration(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  let existingUser = await getUserByUsername(req.body.username);
  if (existingUser) {
    return res.status(400).json({username: "Username taken"});
  }

  // TODO: Check if the stage that this user is claiming to be in-charge of has any other user already assigned. If yes, add an error

  await addUser(user);
});

router.post("/login", (req, res) => {
    const { errors, isValid } = validateLogin(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    let user = await getUserByUsername(req.body.username);
    if (!user) {
        return res.status(400).json({username: "This username does not exist"})
    }

    let isMatch = await bcrypt.compare(req.body.password, user.password);
    if(isMatch) {
        const payload = {
            username: user.username
            // maybe add stage info
        }
        // Sign token
        jwt.sign(payload, SECRET_OR_KEY, { expiresIn: 31556926 }, (err, token) => {
            res.json({
                success: true,
                token: "Bearer " + token,
            });
        });
    } else {
        return res.status(400).json({passwordincorrect: "Password incorrect"});
    }
});

modules.exports = router;
