const express = require('express');
const router = express.Router();

const catchasync = require('../utilities/catchasync')
const ExpressError = require('../utilities/ExpressError');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

const { registerform, register, loginform, login, logout } = require('../controllers/users');


router.route('/register')
    .get(registerform)
    .post(catchasync(register))


router.route('/login')
.get(loginform)
.post(storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),catchasync(login))


router.get('/logout',logout)


module.exports = router;