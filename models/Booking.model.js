import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hallId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BadmintonHall',
        required: true
    },
    courtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Court',
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorInfo',
        required: true
    },
    date: {
        type: String,
        required: true // Format: "YYYY-MM-DD"
    },
    slot: {
        type: String,
        required: true // Format: "HH:MM-HH:MM"
    },
    price: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Completed', 'Pending'],
        default: 'Completed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;