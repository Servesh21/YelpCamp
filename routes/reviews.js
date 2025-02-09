const express = require('express')
const router  = express.Router({mergeParams: true})
const Review = require('../models/reviews')
// const {reviewSchema} = require('../schemas')
const Campground = require('../models/campground')
const ExpressError =require('../utilities/ExpressError');
const catchasync=require('../utilities/catchasync');
const {validateReview,isLoggedIn,isreviewAuthor}= require('../middleware');
const { createReview, deleteReview } = require('../controllers/reviews');



router.post('/', validateReview,isLoggedIn,catchasync(createReview))
router.delete('/:reviewId',isLoggedIn,isreviewAuthor,catchasync(deleteReview))

module.exports= router