import mongoose  from "mongoose";

const Schema = mongoose.Schema;

const BadmintonHallSchema = new Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorInfo',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: String,
    city: String,
    state: String,
    pincode: String,
    image: [
        {
            type: String,
            required: true
        },
    ], // array of image URLs
    amenities: [
        {
            type: String,
        },
    ],
    numberOfCourts: {
        type: Number,
        required: true
    },
    additionalInfo: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const BadmintonHall = mongoose.model('BadmintonHall', BadmintonHallSchema);
export default BadmintonHall;