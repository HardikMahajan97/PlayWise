import mongoose from "mongoose";
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    contact:{
        type:String,
        required:true
    },
    Otp:{
        type:String,
        required:true
    },
    expiry:{
        type:Date,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    isUsed:{
        type:Boolean,
        default:false
    }
});

otpSchema.index({expiration:1}, {expireAfterSeconds:300});

const otpModel = mongoose.model('Otp', otpSchema);
export default otpModel;
