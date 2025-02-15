const mongoose = require('mongoose');
const cities = require("./cities")
const {places,descriptors} = require('./seedhelpers')

const Campground = require('../models/campground')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("database connected");

})

const sample = array => array[Math.floor(Math.random()* array.length)];

const seedDB = async ()=>{
    await Campground.deleteMany({})
    for(let i=0;i<500;i++){
        const random1000= Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20 +10)
       const camp= new Campground({
            author:'67a51328857c202346989262',
        
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            
            description:'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, quod. Sed vitae, mollitia autem reiciendis commodi odit hic doloremque soluta maiores totam consequatur adipisci voluptas vel iste minima molestias officiis.',
            price,
            image: [
                {
                  url: 'https://res.cloudinary.com/dv3lobczw/image/upload/v1739127108/YelpCamp/hqv7zx3vdo0mptfq4nig.jpg',
                  filename: 'YelpCamp/hqv7zx3vdo0mptfq4nig',
                  
                },
                {
                  url: 'https://res.cloudinary.com/dv3lobczw/image/upload/v1739127110/YelpCamp/cgxym9edp8mn0va3clwh.jpg',
                  filename: 'YelpCamp/cgxym9edp8mn0va3clwh',
                  
                },
                {
                  url: 'https://res.cloudinary.com/dv3lobczw/image/upload/v1739127111/YelpCamp/t0vzfie0tbymtcyoxcso.jpg',
                  filename: 'YelpCamp/t0vzfie0tbymtcyoxcso',
                  
                },
                {
                  url: 'https://res.cloudinary.com/dv3lobczw/image/upload/v1739127114/YelpCamp/cnbxhinxszxibsxcqfka.jpg',
                  filename: 'YelpCamp/cnbxhinxszxibsxcqfka',
                  
                }
              ],
              geometry: {
                type: 'Point',
                coordinates:[
                  cities[random1000].longitude,
                  cities[random1000].latitude
                ]
              }
        })
       await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})