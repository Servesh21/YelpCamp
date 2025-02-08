const express = require('express')

const router = express.Router();
const Campground = require('../models/campground');
const {CampgroundSchema } = require('../schemas')
// const { isLoggedIn } = require('../middleware')
const ExpressError =require('../utilities/ExpressError');
const catchasync=require('../utilities/catchasync');
const Review = require('../models/reviews');
const {isLoggedIn} = require('../middleware')
const validatecampground= (req,res,next)=>{
        
       const {error} = CampgroundSchema.validate(req.body);
       if(error){
        const msg = error.details.map(el=>el.message).join(',');
            throw new ExpressError(msg,400);
       }else{
        next();
       }
}

router.get('/',catchasync(async (req,res)=>{ 
    const camps= await Campground.find({});
    res.render('campgrounds/index',{camps})
})
/* End of homepage */)

// Page to create new campground
router.get('/new',isLoggedIn,(req,res)=>{
    res.render('campgrounds/new');
}) 

// To update database 
router.post('/',isLoggedIn,validatecampground,catchasync(async (req,res,next)=>{
   // if(!req.body.campground) throw new ExpressError(400,'Invalid Campground data')

    const campground = new Campground(req.body.campground)
    await campground.save();
    req.flash('success','Successfully created a Campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

/*  Page to display Campgrounds */
router.get('/:id',catchasync(async (req,res)=>{
    
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
        req.flash('error',"Couldn't find the campground");
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{campground});
}))

router.get('/:id/edit',catchasync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error',"Couldn't find the campground");
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit',{campground})
})
)
router.put('/:id',isLoggedIn,validatecampground,catchasync(async (req,res)=>{
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    req.flash('success',`successfully updated ${campground.title}`)
    res.redirect(`/campgrounds//${campground._id}`)
}))

router.delete('/:id',isLoggedIn,catchasync(async (req,res)=>{
    const {id}= req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','successfully deleted a campground')
    res.redirect('/campgrounds');
}))

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success','Successfully Logged out')
    res.redirect('/campgrounds')
})

module.exports =router