const express = require('express')
const methodOverride = require('method-override')
const ExpressError =require('./utilities/ExpressError');
const catchasync=require('./utilities/catchasync');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const Campgrounds= require('./routes/campground')
const reviews = require('./routes/reviews')
const express-session = require('express-session')

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
app.use(methodOverride('_method'))

app.get('/',(req,res)=>{
    res.send("home")
})

app.use('/campgrounds',Campgrounds);

app.use('/campgrounds/:id/reviews',reviews)

app.use(express.static(path.join(__dirname,'public')))


app.all('/*/',(req,res,next)=>{
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