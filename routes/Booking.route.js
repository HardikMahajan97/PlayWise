import express from 'express';

const router = express.Router({mergeParams: true});
import { createBooking, getMyBookings } from '../Controllers/Booking.controller.js';

router.route("/create-booking/:hallId/:courtId").post(createBooking);

router.route('/get-my-bookings').get(getMyBookings);

export default router;