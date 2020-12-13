const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { validateLogin, validateRegistration } = require("../validation/auth");
const { SECRET_OR_KEY } = require("../config/keys");
const { addUser, getUserByUsername } = require("../neo4j-db/user");
const util = require("../util");

/**
 * @route POST api/auth/register
 * @desc Registers a new user
 * @access Public
 */
router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegistration(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  let existingUser = await getUserByUsername(req.body.username);
  if (existingUser) {
    return res.status(400).json({username: "Username taken"});
  }

  let result = await addUser({
    username: req.body.username,
    password: req.body.password,
    type: req.body.type,
    stageId: req.body.stageId,
  });
  if (result === "OK") {
    res.status(200).send("OK");
  } else {
    res.status(400).json(result);
  }
});

/**
 * @route api/auth/login
 * @desc Authenticates a user and logs it in
 * @access Public
 */
router.post("/login", async (req, res) => {
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
      username: user.username,
      // maybe add stage info
      type: user.type,
    };
    if(payload.type === "stage") {
      payload.stageId = user.stageId;
      payload.stage = await util.getStageDetailsById(user.stageId);
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

module.exports = router;
