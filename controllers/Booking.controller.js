import Booking from '../models/Booking.model.js';
import CourtAvailability from "../models/CourtAvailability.model.js";
import Court from "../models/Court.model.js";
import BadmintonHall from "../models/BadmintonHall.model.js";
import generateUserBookingEmail from "../utils/generateUserBookingEmail.js";
import User from "../models/userAuth.model.js";
import sendEmail from "../utils/SendEmail.js";

export const createBooking = async (req, res) => {
    try {
        const { date, slot, customerDetails } = req.body; // Added customerDetails
        const { hallId, courtId } = req.params; // Removed userId from params

        if (!hallId || !courtId || !date || !slot || !customerDetails) {
            return res.status(400).json({ error: "Missing fields." });
        }

        // Create or find user based on email
        let user = await User.findOne({ email: customerDetails.email });
        if (!user) {
            user = new User({
                name: customerDetails.fullName,
                email: customerDetails.email,
                contact: customerDetails.phone,
                age: 0
            });
            await user.save();
        }

        const [court, hall] = await Promise.all([
            Court.findById(courtId),
            BadmintonHall.findById(hallId)
        ]);

        if (!court || !hall) return res.status(404).json({ error: "Court or Hall not found." });
        if (String(court.hallId) !== String(hallId))
            return res.status(400).json({ error: "Court not part of Hall." });

        // const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
        // const availability = await CourtAvailability.findOne({ courtId: courtId, dayOfWeek: dayOfWeek });
        // if (!availability || !availability.slots.includes(slot))
        //     return res.status(400).json({ error: "Slot not available on this day." });

        const existing = await Booking.findOne({ 
            courtId: [courtId], // Fixed array structure
            date: date, 
            slot: slot 
        });
        if (existing) return res.status(409).json({ error: "Slot already booked." });

        const booking = new Booking({
            userId: user._id,
            hallId: hallId,
            courtId: [courtId], // Fixed array structure
            vendorId: hall.vendorId,
            date: date,
            slot: slot,
            price: hall.pricePerHour,
            paymentStatus: "Completed"
        });

        await booking.save();

        // Send email only for first booking or add a flag
        const shouldSendEmail = req.body.sendEmail !== false;
        if (shouldSendEmail) {
            const courtDetails = await Court.findById(courtId);
            const emailHtml = generateUserBookingEmail(
                user.name,
                courtDetails,
                hall,
                { date, slot, price: hall.pricePerHour }
            );
            await sendEmail(user.email, "🎉 Booking Confirmed at " + hall.name, emailHtml);
        }

        return res.status(201).json({ 
            success: true,
            message: "Booking confirmed!", 
            data: { booking, user: { name: user.name, email: user.email } }
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: "Internal server error, could not create booking!", 
            message: err.message 
        });
    }
};


export const getMyBookings = async (req, res) => {
    try {
        const {userId} = req.params;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const bookings = await Booking.find({ userId: userId })
            .populate('hallId', 'name address')
            .populate('courtId', 'number')
            .populate('userId', 'name email contact')
            .sort({ date: 1 });
        if(!bookings) return res.status(401).json({ success: false, error: "No bookings found for this user!" });

        return res.status(200).json({ success: true, data: bookings });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Internal server error, could not fetch your bookings!", message: err.message });
    }
};
