const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb+srv://yermanbekzat:bekadiscoteka@cluster0.9but9g9.mongodb.net/Login-tut");






// Check database connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Database cannot be Connected");
})

// Create Schema
const Loginschema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    firstname: {
        type:String,
        required: true
    },
    lastname: {
        type:String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    age: {
        type: Number,
        min: 0, // Optional: specify a minimum value for age
        max: 120, // Optional: specify a maximum value for age
    },
    password: {
        type: String,
        required: true
    }
});

const itemSchema = new mongoose.Schema({
    title: String,
    description: String,
    images: [String], // Array of image URLs
    created_at: { type: Date, default: Date.now },
    updated_at: Date
});



const Item = new mongoose.model("images", itemSchema);

// collection part
const collection = new mongoose.model("users", Loginschema);





module.exports = {collection, Item};