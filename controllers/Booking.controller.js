import Booking from '../models/Booking.model.js';
import CourtAvailability from "../models/CourtAvailability.model.js";
import Court from "../models/Court.model.js";
import BadmintonHall from "../models/BadmintonHall.model.js";
import generateUserBookingEmail from "../utils/generateUserBookingEmail.js";
import User from "../models/userAuth.model.js";
import sendEmail from "../utils/SendEmail.js";

export const createBooking = async (req, res) => {
    try {
        const { date, slot } = req.body;
        const {hallId, courtId, userId} = req.params;

        if (!userId || !hallId || !courtId || !date || !slot)
            return res.status(400).json({ error: "Missing fields." });

        const [court, hall] = await Promise.all([
            Court.findById(courtId),
            BadmintonHall.findById(hallId)
        ]);
        if (!court || !hall) return res.status(404).json({ error: "Court or Hall not found." });
        if (String(court.hallId) !== String(hallId))
            return res.status(400).json({ error: "Court not part of Hall." });

        const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
        const availability = await CourtAvailability.findOne({ courtId: courtId, dayOfWeek: dayOfWeek });
        if (!availability || !availability.slots.includes(slot))
            return res.status(400).json({ error: "Slot not available on this day." });

        const existing = await Booking.findOne({ courtId: courtId, date: date, slot: slot });
        if (existing) return res.status(409).json({ error: "Slot already booked." });

        const vendorId = hall.vendorId;
        const booking = new Booking({
            userId: userId,
            hallId: hallId,
            courtId: courtId,
            vendorId: vendorId,
            date: date,
            slot: slot,
            price: hall.pricePerHour,
            paymentStatus: "Completed"
        });

        await booking.save();

        const user = await User.findById(userId);
        const courtDetails = await Court.findById(courtId);
        const hallDetails = await BadmintonHall.findById(hallId);

        const emailHtml = generateUserBookingEmail(
            user.name,
            courtDetails,
            hallDetails,
            { date, slot, price: hallDetails.pricePerHour }
        );

        await sendEmail(user.email, "🎉 Booking Confirmed at " + hallDetails.name, emailHtml);
        return res.status(201).json({ message: "Booking confirmed!", data: booking });
    } catch (err) {
        res.status(500).json({ error: "Internal server error, could not create booking!", message: err.message });
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
