const express = require('express')
const methodOverride = require('method-override')
const ExpressError =require('./utilities/ExpressError');
const catchasync=require('./utilities/catchasync');
const ejsMate = require('ejs-mate');

const app = express();
const path=require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground')

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
/* Home Page to display all Campgrounds */
app.get('/campgrounds',catchasync(async (req,res)=>{
    const camps= await Campground.find({});
    res.render('campgrounds/index',{camps})
})
/* End of homepage */)

// Page to create new campground
app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new');
}) 

// To update database 
app.post('/campgrounds',catchasync(async (req,res)=>{
    if(!req.body.campground) throw new ExpressError(400,'Invalid Campground data')
    const campground = new Campground(req.body.campground)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

/*  Page to display Campgrounds */
app.get('/campgrounds/:id',catchasync(async (req,res)=>{
    
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show',{campground});
}))

app.get('/campgrounds/:id/edit',catchasync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground})
})
)
app.put('/campgrounds/:id',catchasync(async (req,res)=>{
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id',catchasync(async (req,res)=>{
    const {id}= req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.all('/(.*)/',(req,res,next)=>{
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