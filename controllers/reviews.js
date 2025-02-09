const Review = require('../models/reviews')
const {reviewSchema} = require('../schemas')
const Campground = require('../models/campground')

module.exports.createReview=async(req,res)=>{
    //    console.log(req.params.id);
        const campground=await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        review.author= req.user._id;
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        req.flash('success','sucessfully created a review')
        res.redirect(`/campgrounds/${campground.id}`);
    
    }

module.exports.deleteReview=async (req,res,next)=>{
        const id = req.params.id;
        const reviewId = req.params.reviewId
        await Campground.findByIdAndUpdate(id,{$pull: {reviews: reviewId}})
        await Review.findByIdAndDelete(reviewId);
        req.flash('success','successfully deleted a review')
        res.redirect(`/campgrounds/${id}`);
    }