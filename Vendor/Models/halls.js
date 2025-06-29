import mongoose from "mongoose";
const Schema = mongoose.Schema;

const hallSchema = new Schema({
    address:{
        type:String,
        unique:true,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
    state:{
        type:String,
        required:true,
    },
    country:{
        type:String,
        required:true,
    },
    Name:{
        type:String,
        unique:true,
        required:true,
    },
    image:[
        {
            type:String,
            required:true,
        },
    ],
    slots:[
        {
            type:String,
            required:true,
        },
    ],
    price:{
        type:Number,
        required:true,
    },
    amenities:{
        type:String,
        required:true,
    },
    numberOfCourts:{
        type:Number,
        required:true,
    },
    matType:{
        type:String,
        required:true,
    },
    additionalInfo:{
        type:String,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the VendorInfo model
        ref: "VendorInfo", // Name of the related model
        required: true,
    },

});

const BadmintonHall = mongoose.model("BadmintonHall", hallSchema);
export default BadmintonHall;