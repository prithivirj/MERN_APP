var express = require('express');
var router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtConf = require('../config/jwt');

router.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {
    try {
      console.log('in index', err, user, info)
      if (err || !user) {
        return res.json({ success: false, message: 'Email / password is incorrect' })
      }
      req.login(user, { session: false }, async (error) => {
        console.log('error::', error)
        if (error) {
          return res.json({ success: false, message: 'Email / password is incorrect' })
        }
        if (info && info.success) {
          const body = { _id: user._id, email: user.email };
          const token = jwt.sign({ expiresIn: jwtConf.expiresIn, user: body }, jwtConf.secret);
          return res.json({ success: true, message: 'Authentication Successful', jwtToken: token });
        }
      });
    } catch (error) {
      return res.json({ success: false, message: 'Error Occured' })
    }
  })(req, res, next);
});



module.exports = router;
