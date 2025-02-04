const express = require('express')

const router = express.Router();
const Campground = require('../models/campground');
const {CampgroundSchema } = require('../schemas')

const ExpressError =require('../utilities/ExpressError');
const catchasync=require('../utilities/catchasync');
const Review = require('../models/reviews');
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
router.get('/new',(req,res)=>{
    res.render('campgrounds/new');
}) 

// To update database 
router.post('/',validatecampground,catchasync(async (req,res,next)=>{
   // if(!req.body.campground) throw new ExpressError(400,'Invalid Campground data')

    const campground = new Campground(req.body.campground)
    await campground.save();
    res.redirect(`/${campground._id}`)
}))

/*  Page to display Campgrounds */
router.get('/:id',catchasync(async (req,res)=>{
    
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show',{campground});
}))

router.get('/:id/edit',catchasync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground})
})
)
router.put('/:id',validatecampground,catchasync(async (req,res)=>{
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/${campground._id}`)
}))

router.delete('/:id',catchasync(async (req,res)=>{
    const {id}= req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/');
}))

module.exports =router