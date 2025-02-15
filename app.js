if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const CampgroundsRoutes= require('./routes/campground')
const reviewsRoutes = require('./routes/reviews')
const session = require('express-session')
const helmet = require('helmet')
const flash = require('connect-flash');
const passport = require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const usersRoutes = require('./routes/users')
const db_url = process.env.DB_Url;
const MongoStore = require('connect-mongo');


const mongoSanitize = require('express-mongo-sanitize')

const app = express();
const path=require('path');
const mongoose = require('mongoose');


const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp'
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
app.use(mongoSanitize())


const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
const sessionsConfig = {
    store,
    name:'session',
    secret: 'thiscouldbeabettersession',
    resave:false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        //secure:true,
        expries: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(methodOverride('_method'))



app.use(session(sessionsConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
 
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",

    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [

    "https://api.maptiler.com/", // add this
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dv3lobczw/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


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
app.get('/',(req,res)=>{
    res.render('home')
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
    // console.log(err)
    res.status(statuscode).render('error',{err})
})

app.listen(5500,()=>{
    console.log("Working on port 5500")

    // console.log(process.env.CLOUDINARY_CLOUD_NAME,process.env.CLOUDINARY_KEY)
})