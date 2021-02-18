const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const UserModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwtConf = require('../config/jwt')
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use('login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        console.log('------------',email,password);
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return done(null, false, { message: 'User not found' });
        }
        await bcrypt.compare(password, user.password).then(resp => {
            console.log(resp);
            if (!resp) {
                return done(null, false, { success: false, message: 'Username or Password is incorrect' });
            }
        });
        return done(null, user, { success: true, message: 'Logged in Successfully' });
    } catch (error) {
        return done(null, false, { success: false, message: 'Error Occured' });
    }
}));

const options = {
    secretOrKey: jwtConf.secret,
    jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('jwt')
}

passport.use(new JWTstrategy(options, async (token, done) => {
    try {
        console.log('token', token);
        UserModel.findById(token.user._id,(err,resp)=>{
            console.log('findById',err,resp);
            if(err){
                return done(null, false, { success: false, message: 'Error Occured' });
            }
            return done(null, resp);
        });
    } catch (error) {
        return done(null, false, { success: false, message: 'Unauthorized' });
    }
}));