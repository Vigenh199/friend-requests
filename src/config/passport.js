const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const { getUserById } = require('../models/users.model');

const strategyOptions = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(new JwtStrategy(strategyOptions, 
  async function(jwt_payload, done) {
    try {
      const user = await getUserById(jwt_payload.sub);

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch(err) {
      console.error(err);
      return done(err, false);
    }
  }  
));

module.exports = passport;
