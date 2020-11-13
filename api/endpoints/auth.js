const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { validateLogin, validateRegistration } = require("../validation/auth");
const { SECRET_OR_KEY } = require("../config/keys");
const { addUser, getUserByUsername } = require("../neo4j-db/user");

router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegistration(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  let existingUser = await getUserByUsername(req.body.username);
  if (existingUser) {
    return res.status(400).json({username: "Username taken"});
  }

  // TODO: Check if the stage that this user is claiming to be in-charge of has any other user already assigned. If yes, add an error

  await addUser({ 
    username: req.body.username,
    password: req.body.password,
    type: req.body.type, 
    stage_id: req.body.stageId 
  });
  res.status(200).end("Done!");
});

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
      stageId: user.stage_id
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
