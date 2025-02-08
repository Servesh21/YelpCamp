const express = require('express')

const router = express.Router();
const Campground = require('../models/campground');
const {CampgroundSchema } = require('../schemas')
// const { isLoggedIn } = require('../middleware')
const ExpressError =require('../utilities/ExpressError');
const catchasync=require('../utilities/catchasync');
const Review = require('../models/reviews');
const {isLoggedIn,isAuthor,validatecampground} = require('../middleware')



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
    campground.author = req.user._id
    await campground.save();
    req.flash('success','Successfully created a Campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

/*  Page to display Campgrounds */
router.get('/:id',catchasync(async (req,res)=>{
    
    const campground = await Campground.findById(req.params.id)
    .populate({
        path: 'reviews',
        populate: { path: 'author' } // Ensure author is populated inside reviews
    })
    .populate('author'); // Populate campground's author too

    res.render('campgrounds/show',{campground});
}))

router.get('/:id/edit',isLoggedIn,isAuthor,catchasync(async (req,res)=>{
    const {id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find the desired campground');
        res.redirect('/campgrounds');
    } 
    // if(!campground.author.equals(req.user._id)){
    //     req.flash('error',"You do not have permission to do that");
    //     // return res.redirect(`/campgrounds/${id}`);
    // }
    res.render('campgrounds/edit',{campground})
})
)
router.put('/:id',isAuthor,isLoggedIn,validatecampground,catchasync(async (req,res)=>{
    const {id} = req.params
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find the desired campground');
        res.redirect('/campgrounds');
    }
        const camp = await Campground.findByIdAndUpdate(id,{...req.body.campground})
        req.flash('success',`successfully updated ${campground.title}`)
        res.redirect(`/campgrounds//${campground._id}`)
    

}))

router.delete('/:id',isAuthor,isLoggedIn,catchasync(async (req,res)=>{
    const {id}= req.params;
    const campground = await Campground.findById(id);

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