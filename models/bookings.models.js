import mongoose from "mongoose";
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the VendorInfo model
        ref: "VendorInfo", // Name of the related model
        required: true,
    },
    isBooked:{
        type:Boolean,
        required:true,
        default:false,
    },
    expiryForBooking:{
        type:Date,
        required:true,
    },
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true,
    },
    slot: {
        type:Date,
        required:true,
    },
    isSlotBooked: {
        type: Boolean,
        required: true,
        default: false,
    },
    isCourtBooked:{
        type: Boolean,
        required: true,
        default: false,
    },
    courtNumber:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        required:true,
        default:() => Date.now(),
    }
});

bookingSchema.index({expiryForBooking:1}, {expireAfterSeconds: 3600});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;