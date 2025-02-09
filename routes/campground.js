const express = require('express')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})


const router = express.Router();
const catchasync=require('../utilities/catchasync');
const {isLoggedIn,isAuthor,validatecampground} = require('../middleware')
const {allcampgrounds, createcampground, viewcampground, editcampgroundform,editcampground, createCampgroundform, deletecampground} = require('../controllers/campground')


router.route('/')
    .get(catchasync(allcampgrounds))
    .post(isLoggedIn, upload.array('image'),validatecampground,  catchasync(createcampground))

router.get('/new',isLoggedIn,createCampgroundform) 

router.route('/:id')
    .get(catchasync(viewcampground))
    .put(isAuthor,isLoggedIn,upload.array('image'),catchasync(editcampground))
    .delete(isAuthor,isLoggedIn,catchasync(deletecampground))

router.get('/:id/edit',isLoggedIn,isAuthor,catchasync(editcampgroundform))

module.exports =router