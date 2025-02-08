const express = require('express')
const router  = express.Router({mergeParams: true})
const Review = require('../models/reviews')
const {reviewSchema} = require('../schemas')
const Campground = require('../models/campground')
const ExpressError =require('../utilities/ExpressError');
const catchasync=require('../utilities/catchasync');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

router.post('/', validateReview,catchasync(async(req,res)=>{
//    console.log(req.params.id);
    const campground=await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','sucessfully created a review')
    res.redirect(`/campgrounds/${campground.id}`);

}))
router.delete('/:reviewId',catchasync(async (req,res,next)=>{
    const id = req.params.id;
    const reviewId = req.params.reviewId
    await Campground.findByIdAndUpdate(id,{$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','successfully deleted a review')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports= router