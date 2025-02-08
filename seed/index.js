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
    for(let i=0;i<50;i++){
        const random1000= Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20 +10)
       const camp= new Campground({
            author:'67a51328857c202346989262',
        
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image:`https://picsum.photos/400?random=${Math.random()}`,
            description:'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, quod. Sed vitae, mollitia autem reiciendis commodi odit hic doloremque soluta maiores totam consequatur adipisci voluptas vel iste minima molestias officiis.',
            price
        })
       await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})