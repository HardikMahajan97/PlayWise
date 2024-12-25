import mongoose from "mongoose";
const Schema = mongoose.Schema;
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
// Vendor Information collection schema
const vendorSchema = new Schema(
{
    Name: {
        type:String,
        required: true,
    },
    email: {
        type:String,
        unique: true,
        required: true,
    },
    contact: {
        type:Number,
        // unique: true,
        required: true,
    } ,
    age: {
        type:Number,
        required: true,
    } ,
    city:{
        type:String,
        required: true,
    }, 
    location: {
        type:String,
        required: true,
    } 
},
{
    timestamps:true,
});

//Adds the username and password fields automatically, and plugins the passportLocalMongoose library.
vendorSchema.plugin(passportLocalMongoose);
const VendorInfo = mongoose.model('VendorInfo', vendorSchema);
export default VendorInfo;
