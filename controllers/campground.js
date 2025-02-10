const Campground = require('../models/campground')
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const {CampgroundSchema}= require('../schemas')
const cloudinary = require('cloudinary').v2

module.exports.allcampgrounds=async (req,res)=>{ 
    const camps= await Campground.find({});
    res.render('campgrounds/index',{camps})
}

module.exports.createCampgroundform = (req,res)=>{
    res.render('campgrounds/new');
}
module.exports.createcampground=async (req,res,next)=>{
    // console.log(req.body);
   // if(!req.body.campground) throw new ExpressError(400,'Invalid Campground data')
   const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
   const campground = new Campground(req.body.campground);
   campground.geometry = geoData.features[0].geometry;
    
    campground.image= req.files.map(f=>({
        url:f.path,
        filename : f.filename
    }));
    campground.author = req.user._id
    await campground.save();
    // console.log(campground)
    req.flash('success','Successfully created a Campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.viewcampground=async (req,res)=>{
    
    const campground = await Campground.findById(req.params.id)
    .populate({
        path: 'reviews',
        populate: { path: 'author' } // Ensure author is populated inside reviews
    })
    .populate('author'); // Populate campground's author too

    res.render('campgrounds/show',{campground});
}

module.exports.editcampgroundform=async (req,res)=>{
    const {id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find the desired campground');
        res.redirect('/campgrounds');
    } 

    res.render('campgrounds/edit',{campground})
}

module.exports.editcampground = async (req, res) => {
    const { id } = req.params;
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });

    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });

    // Add new images
    const imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    campground.geometry = geoData.features[0].geometry;
    campground.image.push(...imgs);
    await campground.save();

    // Delete images if requested
    if (req.body.deleteImages) {
        console.log("Images to delete:", req.body.deleteImages);
        
        for (let filename of req.body.deleteImages) {
            console.log("Deleting:", filename);
            await cloudinary.uploader.destroy(filename);
        }

        await campground.updateOne({
            $pull: { image: { filename: { $in: req.body.deleteImages } } }
        });
    }

    req.flash('success', `Successfully updated ${campground.title}`);
    res.redirect(`/campgrounds/${campground._id}`);
};


module.exports.deletecampground=async (req,res)=>{
    const {id}= req.params;
    const campground = await Campground.findById(id);

    await Campground.findByIdAndDelete(id);
    for (let img of campground.image) {
        await cloudinary.uploader.destroy(img.filename);
      } 
    req.flash('success','successfully deleted a campground')
    res.redirect('/campgrounds');
}