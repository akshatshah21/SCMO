const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const { getUserByUsername } = require("../neo4j-db/user");
const { SECRET_OR_KEY } = require("../config/keys");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_OR_KEY
};

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      let user = await getUserByUsername(jwt_payload.username)
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
  );
}