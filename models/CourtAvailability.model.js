import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const courtAvailabilitySchema = new Schema({
    courtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Court',
        required: true
    },
    dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    slots: {
        type: [String], // e.g., ["08:00-09:00", "09:00-10:00"]
        required: true
    }
});

const CourtAvailability = mongoose.model('CourtAvailability', courtAvailabilitySchema);
export default CourtAvailability;