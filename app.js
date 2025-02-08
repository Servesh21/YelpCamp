const express = require('express')
const methodOverride = require('method-override')
const ExpressError =require('./utilities/ExpressError');
const catchasync=require('./utilities/catchasync');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const CampgroundsRoutes= require('./routes/campground')
const reviewsRoutes = require('./routes/reviews')
const session = require('express-session')
const flash = require('connect-flash');
const passport = require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const usersRoutes = require('./routes/users')

const app = express();
const path=require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');



mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("database connected");

})


app.set('view engine','ejs');
app.engine('ejs',ejsMate)
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({
    extended: true
}))


const sessionsConfig = {

    secret: 'thiscouldbeabettersession',
    resave:false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expries: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(methodOverride('_method'))

app.get('/',(req,res)=>{
    res.send("home")
})

app.use(session(sessionsConfig));
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    // console.log("Current User:", req.user);
    // console.log(req.ses67a51328857c202346989262sion)
    res.locals.currentUser = req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.use('/campgrounds',CampgroundsRoutes);

app.use('/campgrounds/:id/reviews',reviewsRoutes)
app.use('/',usersRoutes);

app.use(express.static(path.join(__dirname,'public')))

// app.get('/fakeUser',async (req,res)=>{
//     const user = new User ({
//     email: 'coltttt@gmail.com',username:'colt'
//     })
//     const newUser = await User.register(user,'chicken')
//     res.send(newUser)
// })
app.all('(./*/)',(req,res,next)=>{
    next(new ExpressError(404,'Page Not Found'))
})

app.use((err,req,res,next)=>{
    const {statuscode =500,}=err;
    if(!err.message) err.message = 'Oh No , Something Went Wrong';
    res.status(statuscode).render('error',{err})
})

app.listen(5500,()=>{
    console.log("Working on port 5500")
})