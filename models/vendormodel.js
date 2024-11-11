import mongoose from "mongoose";
const { Schema } = mongoose;

// Vendor Information collection schema
const user = new Schema({
    Name : {
        type:String,
        required: true
    },
    email: {
        type:String,
        required: true
    },
    username: {
        type:String,
        required: true
    },
    contact: {
        type:Number,
        required: true
    } ,
    age: {
        type:Number,
        required: true
    } ,
    password:{
        type:String,
        required: true
    } ,
    city:{
        type:String,
        required: true
    }, 
    location: {
        type:String,
        required: true
    } 
});


