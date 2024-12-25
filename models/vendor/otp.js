import mongoose from "mongoose";
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    OTP :{
        type: Number,
        required: true,
    }
});

const Dbotp = mongoose.model('Dbotp', otpSchema);
export default Dbotp;