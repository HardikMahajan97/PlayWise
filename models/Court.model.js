import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CourtSchema = new Schema({
    hallId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BadmintonHall',
        required: true
    },
    number: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Court = mongoose.model('Court', CourtSchema);
export default Court;